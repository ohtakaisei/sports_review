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
 * @returns 作成されたレビューのID
 */
export async function createReviewAdmin(
  playerId: string,
  comment: string,
  scores: Record<string, number>,
  overallScore: number
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
  };
  
  // トランザクションで、レビュー作成と選手の集計データ更新を同時に行う
  const reviewId = await db.runTransaction(async (transaction) => {
    const playerRef = db.collection('players').doc(playerId);
    const playerSnap = await transaction.get(playerRef);
    
    // 選手が存在するか確認
    if (!playerSnap.exists) {
      throw new Error('選手が見つかりません');
    }
    
    const playerData = playerSnap.data() as Player;
    const currentReviewCount = playerData.reviewCount || 0;
    const currentSummary = playerData.summary || {};
    
    // 新しい平均スコアを計算
    const newSummary: Record<string, number> = {};
    Object.keys(scores).forEach((itemId) => {
      const currentAvg = currentSummary[itemId] || 0;
      // 加重平均を計算：(現在の平均 × 既存のレビュー数 + 新しいスコア) / (既存のレビュー数 + 1)
      const newAvg = (currentAvg * currentReviewCount + scores[itemId]) / (currentReviewCount + 1);
      newSummary[itemId] = Math.round(newAvg * 100) / 100; // 小数点2桁まで
    });
    
    // 選手データを更新
    transaction.update(playerRef, {
      reviewCount: currentReviewCount + 1,
      summary: newSummary,
      updatedAt: FieldValue.serverTimestamp(),
    });
    
    // レビューを作成
    const reviewRef = db.collection('reviews').doc();
    transaction.set(reviewRef, reviewData);
    
    return reviewRef.id;
  });
  
  return reviewId;
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

