import { NextRequest, NextResponse } from 'next/server';
import { createGameReviewAdmin } from '@/lib/firebase/admin-firestore';
import { SCORE_MAP, ScoreGrade } from '@/lib/types';

/**
 * 試合レビューを投稿するAPI（Admin SDK使用）
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const body = await request.json();
    const { gameId } = params;

    // バリデーション
    if (!body.playerId || !body.playerName || !body.comment || body.overallGrade === undefined) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています（playerId, playerName, comment, overallGrade）' },
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
  { params }: { params: { gameId: string } }
) {
  try {
    const { getGameReviews } = await import('@/lib/firebase/firestore');
    const { gameId } = params;
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

