import { getAdminFirestore } from './admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Player } from '@/lib/types';

/**
 * サーバー側専用のFirestore操作関数
 * 
 * このファイルはAPI Routesでのみ使用されます。
 * Firebase Admin SDKを使用することで、セキュリティルールをバイパスして
 * データベースへの書き込みが可能になります。
 */

/**
 * レビューを投稿（Admin SDK使用）
 * 
 * トランザクションで以下を同時に実行：
 * 1. レビューをreviewsコレクションに追加
 * 2. 選手データ（reviewCount, summary）を更新
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
  const db = getAdminFirestore();
  
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
  
  // レビューを作成（選手データの更新は不要 - リアルタイム集計を使用）
  const reviewRef = db.collection('reviews').doc();
  await db.runTransaction(async (transaction) => {
    // 選手が存在するか確認
    const playerRef = db.collection('players').doc(playerId);
    const playerSnap = await transaction.get(playerRef);
    
    if (!playerSnap.exists) {
      throw new Error('選手が見つかりません');
    }
    
    // レビューを作成
    transaction.set(reviewRef, reviewData);
  });
  
  const reviewId = reviewRef.id;
  
  return reviewId;
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

