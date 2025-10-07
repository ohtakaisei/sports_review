import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from './config';
import { Player, Review } from '@/lib/types';

// 選手一覧を取得
export async function getPlayers(): Promise<Player[]> {
  const playersCol = collection(db, 'players');
  const snapshot = await getDocs(playersCol);
  return snapshot.docs.map((doc) => ({ ...doc.data(), playerId: doc.id } as Player));
}

// 特定の選手を取得
export async function getPlayer(playerId: string): Promise<Player | null> {
  const playerDoc = doc(db, 'players', playerId);
  const snapshot = await getDoc(playerDoc);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return { ...snapshot.data(), playerId: snapshot.id } as Player;
}

// 選手のレビューを取得
export async function getPlayerReviews(
  playerId: string,
  limitCount: number = 20
): Promise<Review[]> {
  const reviewsCol = collection(db, 'reviews');
  // インデックス作成中は、orderByを一時的に削除
  const q = query(
    reviewsCol,
    where('playerId', '==', playerId),
    where('status', '==', 'published'),
    // orderBy('createdAt', 'desc'), // 一時的にコメントアウト
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      reviewId: doc.id,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    } as Review;
  });
}

// レビューを投稿（トランザクションで選手の集計データも更新）
export async function createReview(
  playerId: string,
  comment: string,
  scores: Record<string, number>,
  overallScore: number
): Promise<string> {
  const reviewData = {
    playerId,
    comment,
    scores,
    overallScore,
    status: 'published',
    createdAt: Timestamp.now(),
  };
  
  // トランザクションで、レビュー作成と選手の集計データ更新を同時に行う
  const reviewId = await runTransaction(db, async (transaction) => {
    const playerRef = doc(db, 'players', playerId);
    const playerSnap = await transaction.get(playerRef);
    
    if (!playerSnap.exists()) {
      throw new Error('Player not found');
    }
    
    const playerData = playerSnap.data() as Player;
    const currentReviewCount = playerData.reviewCount || 0;
    const currentSummary = playerData.summary || {};
    
    // 新しい平均を計算
    const newSummary: Record<string, number> = {};
    Object.keys(scores).forEach((itemId) => {
      const currentAvg = currentSummary[itemId] || 0;
      const newAvg = (currentAvg * currentReviewCount + scores[itemId]) / (currentReviewCount + 1);
      newSummary[itemId] = Math.round(newAvg * 100) / 100; // 小数点2桁まで
    });
    
    // 選手データを更新
    transaction.update(playerRef, {
      reviewCount: currentReviewCount + 1,
      summary: newSummary,
    });
    
    // レビューを作成
    const reviewRef = doc(collection(db, 'reviews'));
    transaction.set(reviewRef, reviewData);
    
    return reviewRef.id;
  });
  
  return reviewId;
}

