import { NextRequest, NextResponse } from 'next/server';
import { getPlayerAdmin, updatePlayerAdmin } from '@/lib/firebase/admin-firestore';
import { PlayerStats } from '@/lib/types';

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

/**
 * ESPNと契約情報サイトから選手情報を取得し、GPT-4o-miniで構造化データに変換してFirestoreを更新するAPI
 *
 * 情報ソース:
 * - espnUrl: スタッツ、チーム、ポジション、背番号
 * - contractUrl: 契約金額、契約年数（Spotrac等）
 *
 * 両サイトを並行fetchし、テキストを合体して1回のGPT呼び出しで処理する。
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId } = body;

    if (!playerId) {
      return NextResponse.json(
        { error: 'playerIdが必要です' },
        { status: 400 }
      );
    }

    // 1. Firestoreから選手データを取得
    const player = await getPlayerAdmin(playerId);
    if (!player) {
      return NextResponse.json(
        { error: '選手が見つかりません' },
        { status: 404 }
      );
    }

    if (!player.espnUrl) {
      return NextResponse.json(
        { error: 'ESPN URLが設定されていません' },
        { status: 400 }
      );
    }

    // 2. ESPN + 契約サイトを並行フェッチ
    console.log('[AI Update] Fetching ESPN:', player.espnUrl);
    if (player.contractUrl) {
      console.log('[AI Update] Fetching contract page:', player.contractUrl);
    }

    const fetchPromises: Promise<{ source: string; text: string } | null>[] = [
      // ESPN（必須）
      fetch(player.espnUrl, { headers: FETCH_HEADERS })
        .then(async (res) => {
          if (!res.ok) throw new Error(`ESPN HTTP ${res.status}`);
          const html = await res.text();
          return { source: 'espn', text: extractTextFromHtml(html) };
        })
        .catch((err) => {
          console.error('[AI Update] ESPN fetch failed:', err.message);
          return null;
        }),
    ];

    // 契約サイト（任意）
    if (player.contractUrl) {
      fetchPromises.push(
        fetch(player.contractUrl, { headers: FETCH_HEADERS })
          .then(async (res) => {
            if (!res.ok) throw new Error(`Contract page HTTP ${res.status}`);
            const html = await res.text();
            return { source: 'contract', text: extractTextFromHtml(html) };
          })
          .catch((err) => {
            console.error('[AI Update] Contract page fetch failed:', err.message);
            return null;
          })
      );
    }

    const results = await Promise.all(fetchPromises);
    const espnResult = results[0];
    const contractResult = results[1] ?? null;

    if (!espnResult || espnResult.text.length < 100) {
      return NextResponse.json(
        { error: 'ESPNページから十分な情報を取得できませんでした' },
        { status: 502 }
      );
    }

    console.log('[AI Update] ESPN text length:', espnResult.text.length);
    if (contractResult) {
      console.log('[AI Update] Contract text length:', contractResult.text.length);
    }

    // 3. GPT-4o-miniに送信（1回の呼び出しで全フィールド処理）
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEYが設定されていません' },
        { status: 500 }
      );
    }

    // プロンプト構築
    let sourceText = `--- ESPNテキスト ---\n${espnResult.text.substring(0, 5000)}`;
    if (contractResult && contractResult.text.length >= 50) {
      sourceText += `\n\n--- 契約情報テキスト ---\n${contractResult.text.substring(0, 3000)}`;
    }

    const contractInstruction = contractResult
      ? 'contractAmountとcontractYearsは「契約情報テキスト」から抽出。'
      : '';

    const userPrompt = `以下のテキストからNBA選手の変動情報を抽出しJSON形式で返してください。

${sourceText}

JSON形式:
{
  "team": "チーム名（日本語、例: ロサンゼルス・レイカーズ）",
  "position": "PG/SG/SF/PF/C",
  "number": 背番号,
  "stats": {
    "pts": 平均得点, "ast": 平均アシスト, "reb": 平均リバウンド,
    "fg": FG成功率, "threePtPct": 3PT成功率, "ftPct": FT成功率,
    "stl": 平均スティール, "blk": 平均ブロック, "tov": 平均ターンオーバー,
    "mpg": 平均出場時間(分), "gp": 出場試合数, "season": "例:2024-25"
  },
  "contractAmount": 年俸(ドル,数値),
  "contractYears": 契約年数
}
ルール: テキストにある情報のみ。見つからない項目はnull。JSONのみ返答。team/position/number/statsは「ESPNテキスト」から抽出。${contractInstruction}`;

    console.log('[AI Update] Calling GPT-4o-mini...');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'NBA選手情報をテキストから正確にJSON抽出する。推測禁止。チーム名は日本語正式名称に変換。',
          },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
        max_tokens: 512,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error('[AI Update] OpenAI API error:', errorData);
      return NextResponse.json(
        { error: `OpenAI APIエラー (HTTP ${openaiResponse.status})`, details: errorData.error?.message },
        { status: 502 }
      );
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'OpenAIからの応答にコンテンツがありません' },
        { status: 502 }
      );
    }

    console.log('[AI Update] GPT-4o-mini response:', content);

    // 4. JSONをパース
    let parsedData;
    try {
      parsedData = JSON.parse(content);
    } catch {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    // 5. 変動フィールドのみ更新データを構築
    const updatedFields: string[] = [];
    const updateData: Partial<Record<string, unknown>> = {};

    if (parsedData.team != null) {
      updateData.team = parsedData.team;
      updatedFields.push('team');
    }
    if (parsedData.position != null) {
      updateData.position = parsedData.position;
      updatedFields.push('position');
    }
    if (parsedData.number != null) {
      updateData.number = parsedData.number;
      updatedFields.push('number');
    }

    // stats（既存のstatsとマージ）
    if (parsedData.stats != null) {
      const newStats: PlayerStats = {
        pts: parsedData.stats.pts ?? player.stats?.pts ?? 0,
        ast: parsedData.stats.ast ?? player.stats?.ast ?? 0,
        reb: parsedData.stats.reb ?? player.stats?.reb ?? 0,
        fg: parsedData.stats.fg ?? player.stats?.fg ?? 0,
        season: parsedData.stats.season ?? player.stats?.season ?? '',
        stl: parsedData.stats.stl ?? player.stats?.stl ?? undefined,
        blk: parsedData.stats.blk ?? player.stats?.blk ?? undefined,
        tov: parsedData.stats.tov ?? player.stats?.tov ?? undefined,
        mpg: parsedData.stats.mpg ?? player.stats?.mpg ?? undefined,
        gp: parsedData.stats.gp ?? player.stats?.gp ?? undefined,
        threePtPct: parsedData.stats.threePtPct ?? player.stats?.threePtPct ?? undefined,
        ftPct: parsedData.stats.ftPct ?? player.stats?.ftPct ?? undefined,
      };
      const cleanStats = Object.fromEntries(
        Object.entries(newStats).filter(([, v]) => v !== undefined)
      );
      updateData.stats = cleanStats;
      updatedFields.push('stats');
    }

    if (parsedData.contractAmount != null) {
      updateData.contractAmount = parsedData.contractAmount;
      updatedFields.push('contractAmount');
    }
    if (parsedData.contractYears != null) {
      updateData.contractYears = parsedData.contractYears;
      updatedFields.push('contractYears');
    }

    if (updatedFields.length === 0) {
      return NextResponse.json({
        success: true,
        playerId,
        updatedFields: [],
        message: '更新対象の情報が見つかりませんでした',
      });
    }

    // 6. Firestoreを更新
    const updatedPlayer = {
      ...player,
      ...updateData,
    };

    await updatePlayerAdmin(updatedPlayer);
    console.log('[AI Update] Player updated successfully:', playerId, updatedFields);

    return NextResponse.json({
      success: true,
      playerId,
      updatedFields,
      playerData: updateData,
      message: `${updatedFields.length}項目を更新しました`,
    });
  } catch (error) {
    console.error('[AI Update] Error:', error);
    return NextResponse.json(
      {
        error: 'AI更新に失敗しました',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * HTMLからテキストを抽出する
 */
function extractTextFromHtml(html: string): string {
  let text = html;
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ');
  text = text.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, ' ');
  text = text.replace(/<[^>]+>/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}
