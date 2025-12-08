import { NextRequest, NextResponse } from 'next/server';
import { createGame, checkGameExists, getGames } from '@/lib/firebase/firestore';
import { Game, GamePlayerStats } from '@/lib/types';

/**
 * ChatGPT APIを使って試合結果を取得して登録するAPI
 * 
 * 環境変数:
 * - OPENAI_API_KEY: OpenAI APIキー
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, homeTeam, awayTeam } = body;

    // バリデーション
    if (!date || !homeTeam || !awayTeam) {
      return NextResponse.json(
        { error: '日付、ホームチーム、アウェイチームは必須です' },
        { status: 400 }
      );
    }

    // 重複チェック
    const exists = await checkGameExists(date, homeTeam, awayTeam);
    if (exists) {
      return NextResponse.json(
        { error: 'この試合は既に登録されています', duplicate: true },
        { status: 400 }
      );
    }

    // 同じ日の既存試合を取得（重複防止のため）
    const existingGames = await getGames(100);
    const sameDayGames = existingGames.filter((g) => g.date === date);

    // OpenAI APIキーの確認
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEYが設定されていません' },
        { status: 500 }
      );
    }

    // ChatGPTに試合結果を依頼
    const existingGamesInfo = sameDayGames.length > 0
      ? `\n\n⚠️ 重要: ${date}には既に以下の試合が登録されています。これらの試合とは異なる試合を返してください：\n${sameDayGames.map(g => `- ${g.awayTeam} vs ${g.homeTeam} (${g.awayScore}-${g.homeScore})`).join('\n')}`
      : '';

    const prompt = `
以下の情報を元に、${date}に行われた${homeTeam} vs ${awayTeam}のNBA試合結果をJSON形式で返してください。
${existingGamesInfo}

⚠️ 重複チェック: 上記の既存試合と同じ試合を返さないでください。もし${homeTeam} vs ${awayTeam}の試合が既に登録されている場合は、エラーメッセージを返してください。

返すJSON形式:
{
  "date": "YYYY-MM-DD",
  "homeTeam": "チーム名",
  "awayTeam": "チーム名",
  "homeScore": スコア（数値）,
  "awayScore": スコア（数値）,
  "status": "finished",
  "players": [
    {
      "playerId": "player-xxx",
      "name": "選手名",
      "team": "home" or "away",
      "pts": 得点（数値）,
      "ast": アシスト（数値）,
      "reb": リバウンド（数値）,
      "fg": フィールドゴール成功率（数値、0-100）,
      "fga": フィールドゴール試投数（数値、オプション）,
      "fgm": フィールドゴール成功数（数値、オプション）,
      "threePt": 3ポイント成功数（数値、オプション）,
      "threePtA": 3ポイント試投数（数値、オプション）,
      "ft": フリースロー成功数（数値、オプション）,
      "fta": フリースロー試投数（数値、オプション）,
      "stl": スティール（数値、オプション）,
      "blk": ブロック（数値、オプション）,
      "tov": ターンオーバー（数値、オプション）,
      "pf": パーソナルファウル（数値、オプション）,
      "plusMinus": +/-スコア（数値、オプション）,
      "minutes": "出場時間（例: 35:23）"（文字列、オプション）
    }
  ]
}

JSONのみを返してください。説明文は不要です。
`;

    // OpenAI APIを呼び出し
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // または 'gpt-4', 'gpt-3.5-turbo' など
        messages: [
          {
            role: 'system',
            content: 'あなたはNBAの試合結果を正確にJSON形式で返すアシスタントです。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // より一貫性のある出力のため
        response_format: { type: 'json_object' }, // JSON形式で返す
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('ChatGPTからの応答が空です');
    }

    // JSONをパース
    let gameData;
    try {
      gameData = JSON.parse(content);
    } catch (parseError) {
      // JSONパースに失敗した場合、コードブロックを除去して再試行
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      gameData = JSON.parse(cleanedContent);
    }

    // データを検証・整形
    const formattedGameData: Omit<Game, 'gameId' | 'createdAt'> = {
      date: gameData.date || date,
      homeTeam: gameData.homeTeam || homeTeam,
      awayTeam: gameData.awayTeam || awayTeam,
      homeScore: gameData.homeScore || 0,
      awayScore: gameData.awayScore || 0,
      status: gameData.status || 'finished',
      players: (gameData.players || []).map((player: any) => ({
        playerId: player.playerId || `player-${player.name?.toLowerCase().replace(/\s+/g, '-')}`,
        name: player.name,
        team: player.team === 'home' ? 'home' : 'away',
        pts: player.pts || 0,
        ast: player.ast || 0,
        reb: player.reb || 0,
        fg: player.fg || 0,
        fga: player.fga,
        fgm: player.fgm,
        threePt: player.threePt,
        threePtA: player.threePtA,
        ft: player.ft,
        fta: player.fta,
        stl: player.stl,
        blk: player.blk,
        tov: player.tov,
        pf: player.pf,
        plusMinus: player.plusMinus,
        minutes: player.minutes,
      })) as GamePlayerStats[],
    };

    // Firestoreに保存
    const gameId = await createGame(formattedGameData);

    return NextResponse.json({
      success: true,
      gameId,
      gameData: formattedGameData,
      message: 'ChatGPTから試合結果を取得して登録しました',
    });
  } catch (error) {
    console.error('ChatGPTからの試合結果取得に失敗:', error);
    return NextResponse.json(
      {
        error: 'ChatGPTからの試合結果取得に失敗しました',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

