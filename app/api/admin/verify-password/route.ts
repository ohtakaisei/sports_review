import { NextRequest, NextResponse } from 'next/server';

/**
 * 管理者パスワードを検証するAPI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('[Admin Auth] ADMIN_PASSWORD環境変数が設定されていません');
      return NextResponse.json(
        { error: '管理者パスワードが設定されていません' },
        { status: 500 }
      );
    }

    if (password === adminPassword) {
      return NextResponse.json({
        success: true,
        message: '認証成功',
      });
    } else {
      return NextResponse.json(
        { error: 'パスワードが正しくありません' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('パスワード検証エラー:', error);
    return NextResponse.json(
      { error: 'パスワード検証に失敗しました' },
      { status: 500 }
    );
  }
}



