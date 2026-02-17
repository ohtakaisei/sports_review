// 簡易的なレート制限（メモリベース）
// 本番環境ではVercel KVやRedisを使用することを推奨

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// レート制限の設定
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1時間（ミリ秒）
const RATE_LIMIT_MAX_ATTEMPTS = 50; // 1時間あたりの最大投稿数

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // 新しいエントリまたはリセット時間が過ぎた場合
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_ATTEMPTS - 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
  }

  if (entry.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // カウントを増やす
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_ATTEMPTS - entry.count,
    resetTime: entry.resetTime,
  };
}

// 古いエントリをクリーンアップ（定期的に実行）
export function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// 5分ごとにクリーンアップを実行
setInterval(cleanupRateLimit, 5 * 60 * 1000);

// --- 対策2: 同一選手レビュー回数制限 ---

const playerReviewCounts = new Map<string, { count: number; firstReviewAt: number }>();

const PLAYER_REVIEW_MAX = 2; // 同じ選手へのレビューは2回まで

export function checkPlayerReviewLimit(
  ip: string,
  playerId: string,
  gameId?: string
): { allowed: boolean; remaining: number } {
  const now = Date.now();

  // 古いエントリを削除（24時間以上前のもの）
  const oneDayMs = 24 * 60 * 60 * 1000;
  for (const [k, v] of playerReviewCounts.entries()) {
    if (now - v.firstReviewAt > oneDayMs) playerReviewCounts.delete(k);
  }

  // キーを生成
  const key = gameId
    ? `${ip}:game:${gameId}:player:${playerId}`
    : `${ip}:player:${playerId}`;

  const entry = playerReviewCounts.get(key);

  if (!entry) {
    playerReviewCounts.set(key, { count: 1, firstReviewAt: now });
    return { allowed: true, remaining: PLAYER_REVIEW_MAX - 1 };
  }

  if (entry.count >= PLAYER_REVIEW_MAX) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: PLAYER_REVIEW_MAX - entry.count };
}

// --- 対策4: 重複コメント検出 ---

const recentComments = new Map<string, number>();

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export function checkDuplicateComment(ip: string, comment: string): boolean {
  const key = `${ip}:${simpleHash(comment.trim())}`;
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  // 古いエントリを削除
  for (const [k, time] of recentComments.entries()) {
    if (now - time > oneHour) recentComments.delete(k);
  }

  if (recentComments.has(key)) {
    return true; // 重複あり
  }

  recentComments.set(key, now);
  return false; // 重複なし
}
