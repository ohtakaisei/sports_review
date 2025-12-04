import { NextRequest, NextResponse } from 'next/server';
import { searchPlayers } from '@/lib/firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const team = searchParams.get('team') || undefined;
    const position = searchParams.get('position') || undefined;
    const name = searchParams.get('name') || undefined;
    
    // フィルター条件を構築
    const filters: {
      team?: string;
      position?: string;
    } = {};
    
    if (team) {
      filters.team = team;
    }
    
    if (position) {
      filters.position = position;
    }
    
    // 検索実行
    let players = await searchPlayers(filters);
    
    // 名前でフィルタリング（クライアント側で処理）
    if (name && name.trim()) {
      players = players.filter((player) =>
        player.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    
    // 結果を返す
    return NextResponse.json({
      success: true,
      players: players.map(player => ({
        ...player,
        // FirestoreのTimestampをISO文字列に変換
        createdAt: player.createdAt?.toISOString?.() || player.createdAt,
        updatedAt: player.updatedAt?.toISOString?.() || player.updatedAt,
      })),
      count: players.length,
    });
  } catch (error) {
    console.error('[API] Error searching players:', error);
    return NextResponse.json(
      {
        success: false,
        error: '選手の検索に失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

