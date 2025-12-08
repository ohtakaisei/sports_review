import { NextRequest, NextResponse } from 'next/server';
import { createGame } from '@/lib/firebase/firestore';
import { Game } from '@/lib/types';

/**
 * 試合結果を登録するAPI
 * ChatGPTから受け取った試合結果をFirestoreに保存
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    if (!body.date || !body.homeTeam || !body.awayTeam || !body.players) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    // 試合データを準備
    const gameData: Omit<Game, 'gameId' | 'createdAt'> = {
      date: body.date,
      homeTeam: body.homeTeam,
      awayTeam: body.awayTeam,
      homeScore: body.homeScore || 0,
      awayScore: body.awayScore || 0,
      status: body.status || 'finished',
      players: body.players || [],
    };

    // Firestoreに保存
    const gameId = await createGame(gameData);

    return NextResponse.json({
      success: true,
      gameId,
      message: '試合結果を登録しました',
    });
  } catch (error) {
    console.error('試合結果の登録に失敗:', error);
    return NextResponse.json(
      { error: '試合結果の登録に失敗しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * 試合一覧を取得するAPI
 */
export async function GET(request: NextRequest) {
  try {
    const { getGames } = await import('@/lib/firebase/firestore');
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    const games = await getGames(limit);
    
    return NextResponse.json({
      success: true,
      games,
    });
  } catch (error) {
    console.error('試合一覧の取得に失敗:', error);
    return NextResponse.json(
      { error: '試合一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

