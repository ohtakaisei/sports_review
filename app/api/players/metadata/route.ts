import { NextRequest, NextResponse } from 'next/server';
import { getPlayers } from '@/lib/firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // 全選手を取得（メタデータ用）
    const players = await getPlayers();
    
    // ユニークなチームとポジションを取得
    const teams = Array.from(new Set(players.map((p) => p.team))).sort();
    const positions = Array.from(
      new Set(players.map((p) => p.position).filter((p): p is string => !!p))
    ).sort();
    
    return NextResponse.json({
      success: true,
      teams,
      positions,
      totalPlayers: players.length,
    });
  } catch (error) {
    console.error('[API] Error getting metadata:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'メタデータの取得に失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

