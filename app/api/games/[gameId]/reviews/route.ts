import { NextRequest, NextResponse } from 'next/server';
import { createGameReviewAdmin } from '@/lib/firebase/admin-firestore';
import { SCORE_MAP, ScoreGrade } from '@/lib/types';
import { checkRateLimit, checkPlayerReviewLimit, checkDuplicateComment } from '@/lib/utils/rate-limit';

/**
 * 試合レビューを投稿するAPI（Admin SDK使用）
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const body = await request.json();
    const { gameId } = await params;

    // IPアドレスの取得
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    // 1. グローバルレート制限（1時間50回）
    const rateLimitResult = checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: '投稿回数の制限に達しました。しばらく待ってから再試行してください。' },
        { status: 429 }
      );
    }

    // バリデーション
    if (!body.playerId || !body.playerName || !body.comment || body.overallGrade === undefined) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています（playerId, playerName, comment, overallGrade）' },
        { status: 400 }
      );
    }

    // 2. 同一選手レビュー制限（同じ試合の同じ選手に2回まで）
    const playerLimit = checkPlayerReviewLimit(ip, body.playerId, gameId);
    if (!playerLimit.allowed) {
      return NextResponse.json(
        { error: 'この試合でのこの選手へのレビューは2回までです' },
        { status: 429 }
      );
    }

    // 3. コメント文字数チェック（10-500文字）
    if (!body.comment || typeof body.comment !== 'string' || body.comment.length < 10 || body.comment.length > 500) {
      return NextResponse.json(
        { error: 'コメントは10文字以上500文字以内で入力してください' },
        { status: 400 }
      );
    }

    // 4. 重複コメント検出
    if (checkDuplicateComment(ip, body.comment)) {
      return NextResponse.json(
        { error: '同じ内容のコメントが既に投稿されています' },
        { status: 400 }
      );
    }

    // 総合評価からスコアを計算
    const overallGrade = body.overallGrade as ScoreGrade;
    const overallScore = SCORE_MAP[overallGrade];

    // スコアは空のオブジェクト（試合評価では総合評価のみ）
    const scores: Record<string, number> = {};

    // レビューを作成（Admin SDK使用）
    const reviewId = await createGameReviewAdmin(
      gameId,
      body.playerId,
      body.playerName,
      body.comment,
      scores,
      overallScore,
      overallGrade,
      body.userName,
      body.parentReviewId
    );

    return NextResponse.json({
      success: true,
      reviewId,
      message: 'レビューを投稿しました',
    });
  } catch (error) {
    console.error('レビューの投稿に失敗:', error);
    return NextResponse.json(
      { error: 'レビューの投稿に失敗しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * 試合レビュー一覧を取得するAPI
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { getGameReviews } = await import('@/lib/firebase/firestore');
    const { gameId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const playerId = searchParams.get('playerId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    
    const reviews = await getGameReviews(gameId, playerId, limit);
    
    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error('レビュー一覧の取得に失敗:', error);
    return NextResponse.json(
      { error: 'レビュー一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

