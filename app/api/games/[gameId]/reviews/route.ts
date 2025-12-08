import { NextRequest, NextResponse } from 'next/server';
import { createGameReview } from '@/lib/firebase/firestore';
import { numberToGrade } from '@/lib/utils';

/**
 * 試合レビューを投稿するAPI
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const body = await request.json();
    const { gameId } = params;

    // バリデーション
    if (!body.playerId || !body.playerName || !body.comment || !body.scores) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    // スコアを数値に変換
    const numericScores: Record<string, number> = {};
    Object.entries(body.scores).forEach(([itemId, grade]) => {
      numericScores[itemId] = typeof grade === 'string' 
        ? (grade === 'S' ? 6 : grade === 'A' ? 5 : grade === 'B' ? 4 : grade === 'C' ? 3 : grade === 'D' ? 2 : grade === 'E' ? 1 : 0)
        : Number(grade);
    });

    // 総合評価を計算
    const scores = Object.values(numericScores);
    const overallScore = scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0;
    const overallGrade = numberToGrade(overallScore);

    // レビューを作成
    const reviewId = await createGameReview(
      gameId,
      body.playerId,
      body.playerName,
      body.comment,
      numericScores,
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

