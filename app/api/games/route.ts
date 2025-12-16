import { NextRequest, NextResponse } from 'next/server';
import { createGameAdmin, checkGameExistsAdmin } from '@/lib/firebase/admin-firestore';
import { Game, GamePlayerStats } from '@/lib/types';

/**
 * 試合結果を手動で登録するAPI
 * ESPNなどの情報を手動で入力して登録
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    if (!body.date || !body.homeTeam || !body.awayTeam) {
      return NextResponse.json(
        { error: '日付、ホームチーム、アウェイチームは必須です' },
        { status: 400 }
      );
    }

    // 重複チェック
    const exists = await checkGameExistsAdmin(body.date, body.homeTeam, body.awayTeam);
    if (exists) {
      return NextResponse.json(
        { error: 'この試合は既に登録されています', duplicate: true },
        { status: 400 }
      );
    }

    // 試合データを準備（選手データは不要）
    const gameData: Omit<Game, 'gameId' | 'createdAt'> = {
      date: body.date,
      homeTeam: body.homeTeam,
      awayTeam: body.awayTeam,
      homeScore: body.homeScore ?? 0,
      awayScore: body.awayScore ?? 0,
      status: body.status || 'finished',
      // players フィールドはオプショナル（手動入力時は不要）
      players: body.players ? (body.players as GamePlayerStats[]) : undefined,
    };

    // データ検証
    if (gameData.homeScore === 0 && gameData.awayScore === 0) {
      return NextResponse.json(
        { error: 'スコアが0-0です。正しいスコアを入力してください。' },
        { status: 400 }
      );
    }

    // Firestoreに保存（Admin SDK使用）
    const gameId = await createGameAdmin(gameData);

    return NextResponse.json({
      success: true,
      gameId,
      gameData,
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

