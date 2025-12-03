import { NextRequest, NextResponse } from 'next/server';
import { recalculatePlayerSummary } from '@/lib/firebase/admin-firestore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params;

    if (!playerId) {
      return NextResponse.json(
        { message: '選手IDが必要です' },
        { status: 400 }
      );
    }

    // 選手の集計データを全レビューから再計算
    await recalculatePlayerSummary(playerId);

    return NextResponse.json({
      success: true,
      message: '選手の集計データが再計算されました',
    });

  } catch (error) {
    console.error('集計データ再計算エラー:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : '集計データの再計算に失敗しました' 
      },
      { status: 500 }
    );
  }
}




