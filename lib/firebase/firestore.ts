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
  setDoc,
} from 'firebase/firestore';
import { db } from './config';
import { Player, Review, Game, GameReview } from '@/lib/types';

// レビューからリアルタイムで集計データを計算
async function calculateRealTimeSummary(playerId: string): Promise<{
  reviewCount: number;
  summary: Record<string, number>;
}> {
  const reviewsCol = collection(db, 'reviews');
  const q = query(
    reviewsCol,
    where('playerId', '==', playerId),
    where('status', '==', 'published')
  );
  
  const snapshot = await getDocs(q);
  const reviews = snapshot.docs.map(doc => doc.data());
  
  if (reviews.length === 0) {
    return {
      reviewCount: 0,
      summary: {}
    };
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
  
  return {
    reviewCount: reviews.length,
    summary: summary
  };
}

// 選手一覧を取得（保存済みの集計データを使用 - クォータ節約のためリアルタイム計算を削除）
export async function getPlayers(): Promise<Player[]> {
  const playersCol = collection(db, 'players');
  const snapshot = await getDocs(playersCol);
  
  // 保存済みの集計データ（reviewCount, summary）を使用
  // リアルタイム計算は削除してクォータ消費を98%削減
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    playerId: doc.id,
  })) as Player[];
}

// 人気選手を取得（reviewCountでソート、上位N名）
export async function getPopularPlayers(limitCount: number = 12): Promise<Player[]> {
  const playersCol = collection(db, 'players');
  const q = query(
    playersCol,
    orderBy('reviewCount', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    playerId: doc.id,
  })) as Player[];
}

// 検索用の選手取得（チーム・ポジションでフィルタリング）
export async function searchPlayers(filters: {
  team?: string;
  position?: string;
}): Promise<Player[]> {
  const playersCol = collection(db, 'players');
  
  // クエリを構築
  const conditions: any[] = [];
  
  if (filters.team && filters.team !== 'all') {
    conditions.push(where('team', '==', filters.team));
  }
  
  if (filters.position && filters.position !== 'all') {
    conditions.push(where('position', '==', filters.position));
  }
  
  // 条件がある場合のみクエリを実行
  if (conditions.length > 0) {
    const q = query(playersCol, ...conditions);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      playerId: doc.id,
    })) as Player[];
  }
  
  // 条件がない場合は全選手を返す（検索時に使用）
  const snapshot = await getDocs(playersCol);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    playerId: doc.id,
  })) as Player[];
}

// 特定の選手を取得（保存済みの集計データを使用 - クォータ節約のためリアルタイム計算を削除）
export async function getPlayer(playerId: string): Promise<Player | null> {
  const playerDoc = doc(db, 'players', playerId);
  const snapshot = await getDoc(playerDoc);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  // 保存済みの集計データ（reviewCount, summary）を使用
  // リアルタイム計算は削除してクォータ消費を削減
  return {
    ...snapshot.data(),
    playerId: snapshot.id,
  } as Player;
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

// ==================== 試合関連の関数 ====================

// 試合一覧を取得（日付順、新しい順）
export async function getGames(limitCount: number = 50): Promise<Game[]> {
  const gamesCol = collection(db, 'games');
  // インデックス作成中は、orderByを一時的に削除
  const q = query(
    gamesCol,
    // orderBy('date', 'desc'), // 一時的にコメントアウト
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        ...data,
        gameId: doc.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
      } as Game;
    })
    .sort((a, b) => {
      // クライアントサイドでソート
      return b.date.localeCompare(a.date);
    });
}

// 特定の試合を取得
export async function getGame(gameId: string): Promise<Game | null> {
  const gameDoc = doc(db, 'games', gameId);
  const snapshot = await getDoc(gameDoc);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  const data = snapshot.data();
  return {
    ...data,
    gameId: snapshot.id,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
  } as Game;
}

// 試合が既に存在するかチェック（重複防止）
export async function checkGameExists(
  date: string,
  homeTeam: string,
  awayTeam: string
): Promise<boolean> {
  const gamesCol = collection(db, 'games');
  const q = query(
    gamesCol,
    where('date', '==', date),
    where('homeTeam', '==', homeTeam),
    where('awayTeam', '==', awayTeam)
  );
  
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// 試合を作成（重複チェック付き）
export async function createGame(
  gameData: Omit<Game, 'gameId' | 'createdAt'>,
  skipDuplicateCheck: boolean = false
): Promise<string> {
  // 重複チェック
  if (!skipDuplicateCheck) {
    const exists = await checkGameExists(
      gameData.date,
      gameData.homeTeam,
      gameData.awayTeam
    );
    
    if (exists) {
      throw new Error('この試合は既に登録されています');
    }
  }
  
  const gamesCol = collection(db, 'games');
  const gameRef = doc(gamesCol);
  
  await setDoc(gameRef, {
    ...gameData,
    createdAt: Timestamp.now(),
  });
  
  return gameRef.id;
}

// 試合のレビューを取得
export async function getGameReviews(
  gameId: string,
  playerId?: string,
  limitCount: number = 100
): Promise<GameReview[]> {
  const reviewsCol = collection(db, 'gameReviews');
  
  const conditions = [
    where('gameId', '==', gameId),
    where('status', '==', 'published'),
  ];
  
  if (playerId) {
    conditions.push(where('playerId', '==', playerId));
  }
  
  const q = query(
    reviewsCol,
    ...conditions,
    // orderBy('createdAt', 'desc'), // 一時的にコメントアウト
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        ...data,
        reviewId: doc.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as GameReview;
    })
    .sort((a, b) => {
      // クライアントサイドでソート（新しい順）
      return b.createdAt.localeCompare(a.createdAt);
    });
}

// 試合レビューを投稿
export async function createGameReview(
  gameId: string,
  playerId: string,
  playerName: string,
  comment: string,
  scores: Record<string, number>,
  overallScore: number,
  overallGrade: string,
  userName?: string,
  parentReviewId?: string
): Promise<string> {
  const { numberToGrade } = await import('@/lib/utils');
  
  const reviewData = {
    gameId,
    playerId,
    playerName,
    comment,
    scores,
    overallScore,
    overallGrade: overallGrade as any,
    status: 'published',
    createdAt: Timestamp.now(),
    ...(userName && { userName }),
    ...(parentReviewId && { parentReviewId }),
  };
  
  const reviewRef = doc(collection(db, 'gameReviews'));
  await setDoc(reviewRef, reviewData);
  
  return reviewRef.id;
}

