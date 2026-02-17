import { NextResponse } from 'next/server';

/**
 * 管理APIが有効かチェックし、無効なら403レスポンスを返す。
 *
 * - ローカル: .env.local に ADMIN_ENABLED=true → 通過
 * - 本番(Vercel): ADMIN_ENABLED未設定 → 403
 */
export function checkAdminEnabled(): NextResponse | null {
  if (process.env.ADMIN_ENABLED !== 'true') {
    return NextResponse.json(
      { error: '管理機能は無効です' },
      { status: 403 }
    );
  }
  return null;
}
