import { NextRequest, NextResponse } from 'next/server';

/**
 * ChatGPT APIの簡単なテスト用エンドポイント
 * API制限や接続の問題を確認するために使用
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testQuery } = body;

    // デフォルトのテストクエリ
    const query = testQuery || 'こんにちは。1+1は何ですか？';

    // ChatGPT APIキーの確認
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEYが設定されていません' },
        { status: 500 }
      );
    }

    // テスト用の簡単なプロンプト
    const prompt = query;

    console.log('========================================');
    console.log('[ChatGPT Test] Testing ChatGPT API');
    console.log('[ChatGPT Test] Query:', query);
    console.log('========================================');

    // ChatGPT APIを呼び出し
    const models = [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
    ];

    let data: any;
    let lastError: Error | null = null;
    let successfulModel: string | null = null;

    for (const model of models) {
      try {
        const url = 'https://api.openai.com/v1/chat/completions';

        console.log(`[ChatGPT Test] Trying model: ${model}`);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.2,
            max_tokens: 1024,
          }),
        });

        if (!response.ok) {
          let errorMessage = 'Unknown error';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`;
            console.error(`[ChatGPT Test] Model ${model} error:`, errorData);
          } catch (parseError) {
            const text = await response.text().catch(() => '');
            errorMessage = `HTTP ${response.status}: ${text || 'Unknown error'}`;
            console.error(`[ChatGPT Test] Model ${model} error (text):`, text);
          }

          // 404エラー（モデルが存在しない）の場合は次のモデルを試す
          if (response.status === 404) {
            console.log(`[ChatGPT Test] Model ${model} not found, trying next model...`);
            lastError = new Error(`Model ${model} not found`);
            continue;
          }

          // 429エラー（レート制限）
          if (response.status === 429) {
            console.error(`[ChatGPT Test] Rate limit exceeded with model ${model}`);
            return NextResponse.json({
              success: false,
              error: 'API制限に達しました',
              message: 'ChatGPT APIのレート制限に達しています。しばらく待ってから再試行してください。',
              status: 429,
            }, { status: 200 });
          }

          // その他のエラー
          throw new Error(`ChatGPT API error (${model}): ${errorMessage} (HTTP ${response.status})`);
        }

        data = await response.json();

        // レスポンスの完全な内容をログに出力
        console.log('========================================');
        console.log(`[ChatGPT Test] ✅ Success with model: ${model}`);
        console.log('[ChatGPT Test] Full response data:');
        console.log('========================================');
        console.log(JSON.stringify(data, null, 2));
        console.log('========================================');

        // エラーチェック
        if (data.error) {
          console.error('[ChatGPT Test] Response contains error:', data.error);
          throw new Error(`ChatGPT API error (${model}): ${data.error.message || 'Unknown error'}`);
        }

        // 成功した場合はループを抜ける
        successfulModel = model;
        break;
      } catch (fetchError) {
        console.error(`[ChatGPT Test] Model ${model} failed:`, fetchError);
        lastError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));

        // 最後のモデルの場合はエラーをスロー
        if (model === models[models.length - 1]) {
          throw lastError;
        }

        // 次のモデルを試す
        continue;
      }
    }

    if (!data) {
      throw lastError || new Error('すべてのChatGPTモデルの呼び出しに失敗しました');
    }

    // 選択肢がない場合
    if (!data.choices || data.choices.length === 0) {
      console.error('[ChatGPT Test] No choices:', data);
      return NextResponse.json({
        success: false,
        error: 'レスポンスに選択肢がありません',
        data,
      }, { status: 200 });
    }

    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('[ChatGPT Test] No content in response');
      return NextResponse.json({
        success: false,
        error: 'レスポンスにコンテンツがありません',
        data,
      }, { status: 200 });
    }

    console.log('========================================');
    console.log('[ChatGPT Test] Response content:');
    console.log('========================================');
    console.log(content);
    console.log('========================================');

    return NextResponse.json({
      success: true,
      query,
      response: content,
      model: successfulModel || 'unknown',
      fullResponse: data,
    });
  } catch (error) {
    console.error('[ChatGPT Test] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 }
    );
  }
}
