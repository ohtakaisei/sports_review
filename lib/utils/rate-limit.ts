// 簡易的なレート制限（メモリベース）
// 本番環境ではVercel KVやRedisを使用することを推奨

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// レート制限の設定
const RATE_LIMIT_WINDOW = 60 * 1000; // 1分間（ミリ秒）
const RATE_LIMIT_MAX_ATTEMPTS = 2; // 1分間あたりの最大投稿数

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
