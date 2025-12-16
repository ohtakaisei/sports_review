import { NextRequest, NextResponse } from 'next/server';
import { getGames } from '@/lib/firebase/firestore';
import { createGameAdmin, checkGameExistsAdmin } from '@/lib/firebase/admin-firestore';
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

    // バリデーション（日付は必須、チーム名はオプション）
    if (!date) {
      return NextResponse.json(
        { error: '日付は必須です' },
        { status: 400 }
      );
    }
    
    // 日付の検証とログ出力
    const requestDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    requestDate.setHours(0, 0, 0, 0);
    const isFutureDate = requestDate > today;
    const isPastDate = requestDate < today;
    
    console.log('[Date Validation] Request date:', date);
    console.log('[Date Validation] Today:', today.toISOString().split('T')[0]);
    console.log('[Date Validation] Is future date:', isFutureDate);
    console.log('[Date Validation] Is past date:', isPastDate);
    
    if (isFutureDate) {
      console.warn('[Date Validation] ⚠️ Warning: Requested date is in the future. ChatGPT may not have information about future games.');
    }

    // チーム名が指定されている場合のみ重複チェック
    if (homeTeam && awayTeam) {
      let exists = false;
      try {
        exists = await checkGameExistsAdmin(date, homeTeam, awayTeam);
      } catch (error) {
        console.error('重複チェック中にエラー:', error);
        return NextResponse.json(
          { 
            error: '重複チェック中にエラーが発生しました',
            details: error instanceof Error ? error.message : String(error)
          },
          { status: 500 }
        );
      }
      
      if (exists) {
        return NextResponse.json(
          { error: 'この試合は既に登録されています', duplicate: true },
          { status: 400 }
        );
      }
    }

    // 同じ日の既存試合を取得（重複防止のため）
    let existingGames: Game[] = [];
    try {
      existingGames = await getGames(100);
    } catch (error) {
      console.error('既存試合取得中にエラー:', error);
      // このエラーは致命的ではないので、続行
    }
    const sameDayGames = existingGames.filter((g) => g.date === date);

    // ChatGPT APIキーの確認
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEYが設定されていません' },
        { status: 500 }
      );
    }

    // Geminiに試合結果を依頼
    const existingGamesInfo = sameDayGames.length > 0
      ? `\n\n⚠️ 重要: ${date}には既に以下の試合が登録されています。これらの試合とは異なる試合を返してください：\n${sameDayGames.map(g => `- ${g.awayTeam} vs ${g.homeTeam} (${g.awayScore}-${g.homeScore})`).join('\n')}`
      : '';

    // チーム名が指定されているかどうかでプロンプトを変更
    const isSpecificGame = homeTeam && awayTeam;
    const gameQuery = isSpecificGame 
      ? `${homeTeam} vs ${awayTeam}のNBA試合結果`
      : `${date}に行われたすべてのNBA試合結果（複数の試合がある場合は、すべての試合を含めてください）`;

    // 日付の検証（未来の日付の場合は警告）- 既に上で定義した変数を使用
    const dateWarning = isFutureDate 
      ? `\n\n⚠️ 警告: 指定された日付（${date}）は未来の日付です。未来の試合の場合は、スケジュール情報を返してください。`
      : '';

    const prompt = `あなたはNBAの試合結果を正確に取得する専門家です。**必ず最新の実際の情報源（NBA公式サイト、ESPN、Bleacher Report、Basketball Reference、NBA.com、Google検索など）を使用して、実際に行われた試合の情報を取得してください。**

${dateWarning}

**重要: 必ず実際の試合情報を検索してください。推測や例のデータは返さないでください。**

${date}（形式: YYYY-MM-DD）に行われた${gameQuery}を取得してください。

${existingGamesInfo}

⚠️ 重要: 
- 上記の既存試合と同じ試合を返さないでください。
${isSpecificGame ? `- もし${homeTeam} vs ${awayTeam}の試合が既に登録されている場合は、エラーメッセージを返してください。` : ''}
- **試合が存在しない場合、または情報が見つからない場合は、以下のエラー形式で返してください：**
  {
    "error": "試合が見つかりませんでした",
    "message": "${isSpecificGame ? `指定された日付（${date}）とチーム（${homeTeam} vs ${awayTeam}）の試合結果が見つかりませんでした。試合日とチーム名を確認してください。` : `指定された日付（${date}）に試合が見つかりませんでした。試合日を確認してください。`}"
  }
- **スコアが0-0の場合は返さないでください。** これは試合が存在しないか、データが不完全であることを示します。
- **チーム名のバリエーションを考慮してください。** 例えば「ロサンゼルス・レイカーズ」は「Lakers」「LA Lakers」「Los Angeles Lakers」などでも検索してください。
- **日付の形式を確認してください。** ${date}はYYYY-MM-DD形式です。この日付で実際に試合が行われたかどうかを確認してください。
- **必ず実際の試合情報を検索してください。** Google検索やNBA公式サイトなど、最新の情報源を使用してください。

以下のJSON形式で返してください。${isSpecificGame ? '試合が存在しない場合は、上記のエラー形式で返してください。' : '複数の試合がある場合は、すべての試合を含めてください。試合が存在しない場合は、上記のエラー形式で返してください。'}

${isSpecificGame ? `{
  "date": "YYYY-MM-DD",
  "homeTeam": "チーム名（完全な正式名称）",
  "awayTeam": "チーム名（完全な正式名称）",
  "homeScore": スコア（数値）,
  "awayScore": スコア（数値）,
  "status": "finished",
  "players": [` : `複数の試合がある場合は、以下の配列形式で返してください：
{
  "games": [
    {
      "date": "YYYY-MM-DD",
      "homeTeam": "チーム名（完全な正式名称）",
      "awayTeam": "チーム名（完全な正式名称）",
      "homeScore": スコア（数値）,
      "awayScore": スコア（数値）,
      "status": "finished",
      "players": [`}
    {
      "playerId": "player-xxx",
      "name": "選手名（完全な正式名称）",
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
    }${isSpecificGame ? `
  ]
}` : `
      }
    ]
  ]
}`}

重要: 
- **実際の試合結果のみを返してください。推測や架空のデータ、例としてのデータは絶対に返さないでください。**
- **試合が存在しない場合や情報が見つからない場合は、エラー形式で返してください。**
- **スコアが0-0の場合は返さないでください。** これは試合が存在しないことを示します。
- 主要な選手（スターティング5と主要なベンチプレイヤー、少なくとも10名以上）のスタッツを含めてください。
- 各選手のスタッツは実際の試合データから取得してください。デフォルト値や0のみのデータは返さないでください。
- JSONのみを返してください。説明文やコードブロックは不要です。
- チーム名は日本語の正式名称を使用してください（例: "ロサンゼルス・レイカーズ"）。
- 日付は必ず指定された日付（${date}）を使用してください。
`;

    // プロンプトをログに出力
    console.log('========================================');
    console.log('[PROMPT] Full prompt being sent to Gemini:');
    console.log('========================================');
    console.log(prompt);
    console.log('========================================');
    console.log('[PROMPT] End of prompt');
    console.log('========================================');

    // ChatGPT APIを呼び出し（最新モデルを使用、フォールバック付き）
    const models = [
      'gpt-4o',           // 最新のGPT-4oモデル（最高品質）
      'gpt-4o-mini',      // 高速版
      'gpt-4-turbo',      // フォールバック
      'gpt-4',            // フォールバック
    ];
    
    let data: any;
    let lastError: Error | null = null;
    
    for (const model of models) {
      try {
        const url = 'https://api.openai.com/v1/chat/completions';
        
        console.log('[ChatGPT API] ========================================');
        console.log('[ChatGPT API] Trying model:', model);
        console.log('[ChatGPT API] Request date:', date);
        if (homeTeam && awayTeam) {
          console.log('[ChatGPT API] Request teams:', `${awayTeam} vs ${homeTeam}`);
        } else {
          console.log('[ChatGPT API] Request teams: NOT SPECIFIED (fetching all games for the date)');
        }
        
        const requestBody = {
          model: model,
          messages: [
            {
              role: 'system',
              content: `あなたはNBAの試合結果を正確にJSON形式で返す専門家です。

重要:
- 必ず最新の実際の情報源（NBA公式サイト、ESPN、Bleacher Report、Basketball Reference、NBA.comなど）を使用して、実際に行われた試合の情報を取得してください。
- 推測や例のデータは絶対に返さないでください。
- 試合が存在しない場合は、エラー形式で返してください。
- 実際の試合情報が見つからない場合は、エラーを返してください。`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' },
          max_tokens: 16384,
        };
        
        console.log('[ChatGPT API] Request body (without prompt text):', JSON.stringify({
          ...requestBody,
          messages: requestBody.messages.map((msg, i) => 
            i === 1 ? { ...msg, content: `[PROMPT TEXT - ${prompt.length} characters - see above for full content]` } : msg
          )
        }, null, 2));
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          let errorMessage = 'Unknown error';
          let errorDetails: any = null;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`;
            errorDetails = errorData;
            console.error(`[ChatGPT API] Model ${model} error response:`, JSON.stringify(errorData, null, 2));
          } catch (parseError) {
            const text = await response.text().catch(() => '');
            errorMessage = `HTTP ${response.status}: ${text || 'Unknown error'}`;
            console.error(`[ChatGPT API] Model ${model} error (text):`, text);
            errorDetails = { rawText: text };
          }
          
          // 401/403エラー（APIキーの問題）
          if (response.status === 401 || response.status === 403) {
            console.error(`[ChatGPT API] Authentication error with model ${model}`);
            throw new Error(`Vertex AI認証エラー: APIキーが無効または権限がありません。ステータス: ${response.status}, メッセージ: ${errorMessage}`);
          }
          
          // 404エラー（モデルが存在しない）の場合は次のモデルを試す
          if (response.status === 404) {
            console.log(`[ChatGPT API] Model ${model} not found (404), trying next model...`);
            lastError = new Error(`Model ${model} not found (404)`);
            continue;
          }
          
          // 429エラー（レート制限）
          if (response.status === 429) {
            console.error(`[ChatGPT API] Rate limit exceeded with model ${model}`);
            throw new Error(`Vertex AIレート制限に達しました。しばらく待ってから再試行してください。`);
          }
          
          // その他のエラーは即座にスロー
          console.error(`[ChatGPT API] Unexpected error with model ${model}:`, {
            status: response.status,
            statusText: response.statusText,
            errorMessage,
            errorDetails,
          });
          throw new Error(`Vertex AI error (${model}): ${errorMessage} (HTTP ${response.status})`);
        }

        data = await response.json();
        
        // レスポンスの完全な内容をログに出力
        console.log('========================================');
        console.log(`[ChatGPT API] ✅ Success with model: ${model}`);
        console.log('[ChatGPT API] Full response data:');
        console.log('========================================');
        console.log(JSON.stringify(data, null, 2));
        console.log('========================================');
        console.log('[ChatGPT API] End of response data');
        console.log('========================================');
        
        // エラーチェック
        if (data.error) {
          console.error('[ChatGPT API] Response contains error:', data.error);
          throw new Error(`Vertex AI error (${model}): ${data.error.message || 'Unknown error'}`);
        }

        // 成功した場合はループを抜ける
        console.log(`[ChatGPT API] Response structure:`, {
          hasChoices: !!data.choices,
          choicesCount: data.choices?.length || 0,
          hasContent: !!data.choices?.[0]?.message?.content,
        });
        console.log('[ChatGPT API] ========================================');
        break;
        
      } catch (fetchError) {
        console.error(`[ChatGPT API] Model ${model} failed:`);
        console.error(`[ChatGPT API] Error type:`, fetchError instanceof Error ? fetchError.constructor.name : typeof fetchError);
        console.error(`[ChatGPT API] Error message:`, fetchError instanceof Error ? fetchError.message : String(fetchError));
        console.error(`[ChatGPT API] Error stack:`, fetchError instanceof Error ? fetchError.stack : 'No stack trace');
        lastError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
        
        // 最後のモデルの場合はエラーをスロー
        if (model === models[models.length - 1]) {
          throw new Error(`すべてのChatGPTモデルの呼び出しに失敗しました。最後のエラー: ${lastError.message}`);
        }
        
        // 次のモデルを試す
        continue;
      }
    }

    if (!data) {
      console.error('[ChatGPT API] ❌ All models failed');
      console.error('[ChatGPT API] Last error:', lastError);
      throw lastError || new Error('すべてのChatGPTモデルの呼び出しに失敗しました。APIキーとモデル名を確認してください。');
    }

    // 選択肢がない場合
    if (!data.choices || data.choices.length === 0) {
      console.error('[ChatGPT API] No choices:', data);
      throw new Error('ChatGPTからの応答に選択肢がありません');
    }

    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('[ChatGPT API] No content in response');
      console.error('[ChatGPT API] Full response data:', JSON.stringify(data, null, 2));
      console.error('[ChatGPT API] Choices:', data.choices);
      throw new Error('ChatGPTからの応答にコンテンツがありません。APIキーやモデルの設定を確認してください。');
    }

    console.log('========================================');
    console.log('[ChatGPT API] Response content received');
    console.log('[ChatGPT API] Content length:', content.length);
    console.log('========================================');
    console.log('[ChatGPT API] Full response content:');
    console.log('========================================');
    console.log(content);
    console.log('========================================');
    console.log('[ChatGPT API] End of response content');
    console.log('========================================');

    // JSONをパース
    let gameData;
    try {
      gameData = JSON.parse(content);
      console.log('========================================');
      console.log('[ChatGPT API] Parsed JSON data:');
      console.log('========================================');
      console.log(JSON.stringify(gameData, null, 2));
      console.log('========================================');
      console.log('[ChatGPT API] End of parsed JSON data');
      console.log('========================================');
    } catch (parseError) {
      console.error('[ChatGPT API] JSON parse error, trying to clean content...');
      console.error('[ChatGPT API] Parse error:', parseError);
      // JSONパースに失敗した場合、コードブロックを除去して再試行
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      console.log('========================================');
      console.log('[ChatGPT API] Cleaned content:');
      console.log('========================================');
      console.log(cleanedContent);
      console.log('========================================');
      console.log('[ChatGPT API] End of cleaned content');
      console.log('========================================');
      gameData = JSON.parse(cleanedContent);
      console.log('========================================');
      console.log('[ChatGPT API] Parsed JSON data (after cleaning):');
      console.log('========================================');
      console.log(JSON.stringify(gameData, null, 2));
      console.log('========================================');
      console.log('[ChatGPT API] End of parsed JSON data (after cleaning)');
      console.log('========================================');
    }
    
    // ChatGPTからのエラーレスポンスをチェック（試合が見つからない場合は正常なケースとして扱う）
    if (gameData.error) {
      console.log('[ChatGPT API] ChatGPT returned error response (game not found):', gameData.error);
      console.log('[ChatGPT API] Error message:', gameData.message);
      
      // 試合が見つからない場合は、500エラーではなく正常なレスポンスとして返す
      return NextResponse.json({
        success: false,
        error: gameData.error,
        message: gameData.message || '試合が見つかりませんでした',
        gameNotFound: true,
      }, { status: 200 }); // 200 OKで返す（エラーではなく、正常な「見つからなかった」という結果）
    }

    // データ検証
    console.log('[Data Validation] Validating game data...');
    console.log('[Data Validation] Raw gameData:', JSON.stringify(gameData, null, 2));
    
    // 複数の試合が返ってきた場合（games配列がある場合）
    let gamesToProcess: any[] = [];
    if (gameData.games && Array.isArray(gameData.games)) {
      console.log(`[Data Validation] Multiple games found: ${gameData.games.length}`);
      gamesToProcess = gameData.games;
    } else if (gameData.date && gameData.homeTeam && gameData.awayTeam) {
      // 単一の試合の場合
      console.log('[Data Validation] Single game found');
      gamesToProcess = [gameData];
    } else {
      throw new Error('試合データの形式が正しくありません。Geminiからの応答を確認してください。');
    }
    
    if (gamesToProcess.length === 0) {
      throw new Error('試合データが取得できませんでした。Geminiからの応答を確認してください。');
    }
    
    // 最初の試合のみを処理（後で複数試合対応を追加可能）
    const firstGame = gamesToProcess[0];
    console.log('[Data Validation] Processing first game:', JSON.stringify(firstGame, null, 2));
    
    // 必須フィールドの検証
    if (!firstGame.homeTeam && !firstGame.awayTeam) {
      throw new Error('チーム名が取得できませんでした。Geminiからの応答を確認してください。');
    }
    
    // スコアの検証（0-0の場合はエラー）
    const homeScore = firstGame.homeScore ?? 0;
    const awayScore = firstGame.awayScore ?? 0;
    
    if (homeScore === 0 && awayScore === 0) {
      console.error('[Data Validation] Invalid scores: both teams have 0 points');
      throw new Error('スコアが0-0です。試合が存在しないか、Geminiが正しい情報を取得できませんでした。実際の試合日とチーム名を確認してください。');
    }
    
    // 選手データの検証
    const players = firstGame.players || [];
    if (players.length === 0) {
      console.warn('[Data Validation] Warning: No players data found');
      throw new Error('選手データが取得できませんでした。Geminiからの応答を確認してください。');
    }
    
    // 選手のスタッツがすべて0でないかチェック
    const playersWithStats = players.filter((p: any) => 
      (p.pts ?? 0) > 0 || (p.ast ?? 0) > 0 || (p.reb ?? 0) > 0
    );
    
    if (playersWithStats.length === 0) {
      console.error('[Data Validation] Error: All players have 0 stats');
      throw new Error('すべての選手のスタッツが0です。実際の試合データが取得できていません。試合が存在しない可能性があります。');
    }
    
    if (playersWithStats.length < players.length * 0.5) {
      console.warn('[Data Validation] Warning: More than half of players have 0 stats');
    }
    
    console.log('[Data Validation] Validated data:', {
      homeTeam: firstGame.homeTeam || homeTeam,
      awayTeam: firstGame.awayTeam || awayTeam,
      homeScore,
      awayScore,
      playersCount: players.length,
    });

    // データを検証・整形
    const formattedGameData: Omit<Game, 'gameId' | 'createdAt'> = {
      date: firstGame.date || date,
      homeTeam: firstGame.homeTeam || homeTeam,
      awayTeam: firstGame.awayTeam || awayTeam,
      homeScore,
      awayScore,
      status: firstGame.status || 'finished',
      players: players.map((player: any) => {
        if (!player.name) {
          console.warn('[Data Validation] Warning: Player without name:', player);
        }
        return {
          playerId: player.playerId || `player-${player.name?.toLowerCase().replace(/\s+/g, '-')}`,
          name: player.name || '不明な選手',
          team: player.team === 'home' ? 'home' : 'away',
          pts: player.pts ?? 0,
          ast: player.ast ?? 0,
          reb: player.reb ?? 0,
          fg: player.fg ?? 0,
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
        };
      }) as GamePlayerStats[],
    };
    
    console.log('[Data Validation] Formatted game data:', {
      date: formattedGameData.date,
      homeTeam: formattedGameData.homeTeam,
      awayTeam: formattedGameData.awayTeam,
      homeScore: formattedGameData.homeScore,
      awayScore: formattedGameData.awayScore,
      playersCount: formattedGameData.players.length,
    });

    // Firestoreに保存（Admin SDK使用）
    console.log('[Firestore] Saving game data to Firestore...');
    console.log('[Firestore] Data to save:', JSON.stringify(formattedGameData, null, 2));
    
    let gameId: string;
    try {
      gameId = await createGameAdmin(formattedGameData);
      console.log('[Firestore] Game saved successfully, gameId:', gameId);
      
      // 保存されたデータを確認
      const { getGame } = await import('@/lib/firebase/firestore');
      const savedGame = await getGame(gameId);
      console.log('[Firestore] Verified saved game:', JSON.stringify(savedGame, null, 2));
      
      if (!savedGame) {
        throw new Error('保存された試合データの取得に失敗しました');
      }
      
      // 保存されたデータの検証
      if (savedGame.homeScore === 0 && savedGame.awayScore === 0) {
        console.error('[Firestore] Warning: Saved game has 0-0 score');
      }
      if (!savedGame.players || savedGame.players.length === 0) {
        console.error('[Firestore] Warning: Saved game has no players');
      }
      
    } catch (error) {
      console.error('[Firestore] Error saving game:', error);
      throw new Error(
        `Firestoreへの保存に失敗しました: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return NextResponse.json({
      success: true,
      gameId,
      gameData: formattedGameData,
      message: 'ChatGPTから試合結果を取得して登録しました',
      debug: process.env.NODE_ENV === 'development' ? {
        chatgptResponse: content.substring(0, 1000), // 最初の1000文字
        parsedData: gameData,
        formattedData: formattedGameData,
      } : undefined,
    });
  } catch (error) {
    console.error('========================================');
    console.error('[ERROR] ChatGPTからの試合結果取得に失敗');
    console.error('[ERROR] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[ERROR] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[ERROR] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('========================================');
    
    // エラーの詳細を取得
    let errorMessage = 'ChatGPTからの試合結果取得に失敗しました';
    let errorDetails = '';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error instanceof Error) {
      errorDetails = error.message;
      
      // 特定のエラーメッセージを日本語に変換
      if (error.message.includes('OPENAI_API_KEY')) {
        errorMessage = 'OPENAI_API_KEYが設定されていません';
        errorCode = 'API_KEY_MISSING';
      } else if (error.message.includes('permission') || error.message.includes('Permission')) {
        errorMessage = 'Firestoreへの書き込み権限がありません。セキュリティルールを確認してください';
        errorCode = 'FIRESTORE_PERMISSION_ERROR';
      } else if (error.message.includes('FirebaseError')) {
        errorMessage = 'Firestoreへの接続に失敗しました';
        errorCode = 'FIRESTORE_CONNECTION_ERROR';
      } else if (error.message.includes('既に登録されています')) {
        errorMessage = 'この試合は既に登録されています';
        errorCode = 'DUPLICATE_GAME';
      } else if (error.message.includes('ChatGPT API error')) {
        errorMessage = 'ChatGPT APIの呼び出しに失敗しました';
        errorCode = 'CHATGPT_API_ERROR';
      } else if (error.message.includes('試合が見つかりません')) {
        errorMessage = error.message;
        errorCode = 'GAME_NOT_FOUND';
      } else if (error.message.includes('スコアが0-0')) {
        errorMessage = error.message;
        errorCode = 'INVALID_SCORE';
      } else if (error.message.includes('選手データが取得できません')) {
        errorMessage = error.message;
        errorCode = 'NO_PLAYER_DATA';
      } else if (error.message.includes('すべての選手のスタッツが0')) {
        errorMessage = error.message;
        errorCode = 'INVALID_PLAYER_STATS';
      } else {
        errorCode = 'UNKNOWN_ERROR';
      }
    }
    
    return NextResponse.json(
      {
        error: errorMessage,
        errorCode,
        details: errorDetails,
        timestamp: new Date().toISOString(),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 }
    );
  }
}

