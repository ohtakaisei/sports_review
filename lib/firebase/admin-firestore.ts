import { getAdminFirestore } from './admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Player, Review, ScoreGrade } from '@/lib/types';

// 数値からランク（S~F）を計算
function calculateRank(score: number): ScoreGrade {
  const rounded = Math.round(score);
  if (rounded >= 6) return 'S';
  if (rounded >= 5) return 'A';
  if (rounded >= 4) return 'B';
  if (rounded >= 3) return 'C';
  if (rounded >= 2) return 'D';
  if (rounded >= 1) return 'E';
  return 'F';
}

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
    
    // トランザクションでレビュー作成と選手データの更新を同時に行う
    const reviewRef = db.collection('reviews').doc();
    const reviewId = reviewRef.id;
    
    await db.runTransaction(async (transaction) => {
      // レビューを作成
      transaction.set(reviewRef, reviewData);
      
      // 選手データを取得
      const playerData = playerSnap.data() as Player;
      const currentReviewCount = playerData.reviewCount || 0;
      const currentSummary = playerData.summary || {};
      
      // 新しい平均を計算（全レビューを読み取らずに効率的に計算）
      const newSummary: Record<string, number> = {};
      Object.keys(scores).forEach((itemId) => {
        const currentAvg = currentSummary[itemId] || 0;
        // 新しい平均 = (現在の平均 × 現在の件数 + 新しいスコア) / (現在の件数 + 1)
        const newAvg = (currentAvg * currentReviewCount + scores[itemId]) / (currentReviewCount + 1);
        newSummary[itemId] = Math.round(newAvg * 100) / 100; // 小数点2桁まで
      });
      
      // 既存のsummaryの他の項目も保持（新しいレビューに含まれていない項目）
      Object.keys(currentSummary).forEach((itemId) => {
        if (!newSummary[itemId]) {
          newSummary[itemId] = currentSummary[itemId];
        }
      });
      
      // 総合スコアから新しいランクを計算
      const summaryValues = Object.values(newSummary);
      const overallScore = summaryValues.length > 0
        ? summaryValues.reduce((acc, val) => acc + val, 0) / summaryValues.length
        : 0;
      const newRank = calculateRank(overallScore);
      
      // 選手データを更新（ランクも含む）
      transaction.update(playerRef, {
        reviewCount: currentReviewCount + 1,
        summary: newSummary,
        rank: newRank, // 総合ランクを保存
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    
    console.log('[createReviewAdmin] Review created and player summary updated, reviewId:', reviewId);
    
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
