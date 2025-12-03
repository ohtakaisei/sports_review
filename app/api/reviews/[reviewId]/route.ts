import { NextRequest, NextResponse } from 'next/server';
import { deleteReviewAndUpdatePlayer, recalculatePlayerSummary } from '@/lib/firebase/admin-firestore';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;

    if (!reviewId) {
      return NextResponse.json(
        { message: 'レビューIDが必要です' },
        { status: 400 }
      );
    }

    // レビューを削除し、選手の集計データを更新
    await deleteReviewAndUpdatePlayer(reviewId);

    return NextResponse.json({
      success: true,
      message: 'レビューが削除されました',
    });

  } catch (error) {
    console.error('レビュー削除エラー:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'レビューの削除に失敗しました' 
      },
      { status: 500 }
    );
  }
}




