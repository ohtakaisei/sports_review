import { getAdminFirestore } from './admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Player, Review } from '@/lib/types';

/**
 * サーバー側専用のFirestore操作関数
 * 
 * このファイルはAPI Routesでのみ使用されます。
 * Firebase Admin SDKを使用することで、セキュリティルールをバイパスして
 * データベースへの書き込みが可能になります。
 */

/**
 * 特定の選手を取得（Admin SDK使用）
 * 
 * @param playerId - 選手ID
 * @returns 選手データ
 */
export async function getPlayerAdmin(playerId: string): Promise<Player | null> {
  const db = getAdminFirestore();
  const playerDoc = db.collection('players').doc(playerId);
  const snapshot = await playerDoc.get();
  
  if (!snapshot.exists) {
    return null;
  }
  
  return { ...snapshot.data(), playerId: snapshot.id } as Player;
}

/**
 * 選手のレビューを取得（Admin SDK使用）
 * 
 * @param playerId - 選手ID
 * @param limitCount - 取得件数
 * @returns レビュー一覧
 */
export async function getPlayerReviewsAdmin(
  playerId: string,
  limitCount: number = 20
): Promise<Review[]> {
  const db = getAdminFirestore();
  const reviewsCol = db.collection('reviews');
  
  const q = reviewsCol
    .where('playerId', '==', playerId)
    .where('status', '==', 'published')
    .orderBy('createdAt', 'desc')
    .limit(limitCount);
  
  const snapshot = await q.get();
  
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    // TimestampをDate文字列に変換
    const createdAt = data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString();
    
    return {
      ...data,
      reviewId: doc.id,
      createdAt,
    } as Review;
  });
}

/**
 * レビューを投稿（Admin SDK使用）
 * 
 * シンプルな書き込み操作：
 * 1. 選手が存在するか確認
 * 2. レビューをreviewsコレクションに追加
 * 
 * @param playerId - 選手ID
 * @param comment - レビューコメント
 * @param scores - 各項目のスコア（数値）
 * @param overallScore - 総合評価
 * @param userName - ユーザー名（任意）
 * @returns 作成されたレビューのID
 */
export async function createReviewAdmin(
  playerId: string,
  comment: string,
  scores: Record<string, number>,
  overallScore: number,
  userName?: string
): Promise<string> {
  console.log('[createReviewAdmin] Starting, playerId:', playerId);
  
  try {
    console.log('[createReviewAdmin] Getting Admin Firestore instance...');
    const db = getAdminFirestore();
    console.log('[createReviewAdmin] Admin Firestore instance obtained');
    
    // まず選手が存在するか確認（トランザクション外で）
    const playerRef = db.collection('players').doc(playerId);
    const playerSnap = await playerRef.get();
    
    if (!playerSnap.exists) {
      console.error('[createReviewAdmin] Player not found:', playerId);
      throw new Error('選手が見つかりません');
    }
    console.log('[createReviewAdmin] Player exists');
    
    // レビューデータを準備
    const reviewData = {
      playerId,
      comment,
      scores,
      overallScore,
      status: 'published',
      createdAt: FieldValue.serverTimestamp(),
      ...(userName && { userName }), // ユーザー名がある場合のみ追加
    };
    
    console.log('[createReviewAdmin] Review data prepared, creating review...');
    
    // レビューを作成（トランザクションなしでシンプルに書き込み）
    const reviewRef = db.collection('reviews').doc();
    await reviewRef.set(reviewData);
    
    console.log('[createReviewAdmin] Review created, reviewId:', reviewRef.id);
    const reviewId = reviewRef.id;
    
    return reviewId;
  } catch (error) {
    console.error('[createReviewAdmin] Error:', error);
    throw error;
  }
}

/**
 * レビューを削除（選手データの更新は不要 - リアルタイム集計を使用）
 */
export async function deleteReviewAndUpdatePlayer(reviewId: string): Promise<void> {
  const db = getAdminFirestore();
  
  await db.runTransaction(async (transaction) => {
    const reviewRef = db.collection('reviews').doc(reviewId);
    const reviewSnap = await transaction.get(reviewRef);
    
    if (!reviewSnap.exists) {
      throw new Error('レビューが見つかりません');
    }
    
    // レビューを削除（選手データの更新は不要）
    transaction.delete(reviewRef);
  });
}

/**
 * 選手の集計データを全レビューから再計算
 */
export async function recalculatePlayerSummary(playerId: string): Promise<void> {
  const db = getAdminFirestore();
  
  await db.runTransaction(async (transaction) => {
    const playerRef = db.collection('players').doc(playerId);
    const playerSnap = await transaction.get(playerRef);
    
    if (!playerSnap.exists) {
      throw new Error('選手が見つかりません');
    }
    
    // その選手の全レビューを取得
    const reviewsQuery = db.collection('reviews')
      .where('playerId', '==', playerId)
      .where('status', '==', 'published');
    
    const reviewsSnapshot = await reviewsQuery.get();
    const reviews = reviewsSnapshot.docs.map(doc => doc.data());
    
    if (reviews.length === 0) {
      // レビューがない場合、集計データをクリア
      transaction.update(playerRef, {
        reviewCount: 0,
        summary: {},
        updatedAt: FieldValue.serverTimestamp(),
      });
      return;
    }
    
    // 各項目の平均スコアを計算
    const summary: Record<string, number> = {};
    const allItemIds = new Set<string>();
    
    // 全レビューの全項目IDを収集
    reviews.forEach(review => {
      Object.keys(review.scores || {}).forEach(itemId => {
        allItemIds.add(itemId);
      });
    });
    
    // 各項目の平均を計算
    allItemIds.forEach(itemId => {
      const scores = reviews
        .map(review => review.scores?.[itemId])
        .filter(score => score !== undefined) as number[];
      
      if (scores.length > 0) {
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        summary[itemId] = Math.round(average * 100) / 100; // 小数点2桁まで
      }
    });
    
    transaction.update(playerRef, {
      reviewCount: reviews.length,
      summary: summary,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}

/**
 * 選手が存在するか確認（Admin SDK使用）
 * 
 * @param playerId - 選手ID
 * @returns 選手が存在する場合true
 */
export async function checkPlayerExists(playerId: string): Promise<boolean> {
  const db = getAdminFirestore();
  const playerRef = db.collection('players').doc(playerId);
  const playerSnap = await playerRef.get();
  
  return playerSnap.exists;
}
