import { NextRequest, NextResponse } from 'next/server';
import { createReviewAdmin } from '@/lib/firebase/admin-firestore';
import { calculateAverageScore } from '@/lib/utils';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// タイムアウト付きPromiseラッパー
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`操作がタイムアウトしました (${timeoutMs / 1000}秒)`));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export async function POST(request: NextRequest) {
  console.log('[API] Review submission started');
  const startTime = Date.now();
  try {
    const body = await request.json();
    const { playerId, comment, scores, recaptchaToken, userName } = body;
    console.log('[API] Request body parsed, playerId:', playerId);

    // reCAPTCHA検証（オプショナル：環境変数とトークンの両方が存在する場合のみ）
    if (process.env.RECAPTCHA_SECRET_KEY && recaptchaToken) {
      try {
        const recaptchaResponse = await fetch(
          `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
          { method: 'POST' }
        );
        const recaptchaData = await recaptchaResponse.json();
        
        console.log('reCAPTCHA verification result:', {
          success: recaptchaData.success,
          score: recaptchaData.score,
          errors: recaptchaData['error-codes'],
        });
        
        if (!recaptchaData.success) {
          const errorCodes = recaptchaData['error-codes'] || [];
          console.error('reCAPTCHA verification failed:', errorCodes);
          // reCAPTCHA検証が失敗しても続行（オプショナルとして扱う）
          console.warn('reCAPTCHA検証に失敗しましたが、レビュー投稿を続行します');
        } else if (recaptchaData.score < 0.5) {
          console.warn('reCAPTCHA score too low:', recaptchaData.score);
          // スコアが低くても続行（オプショナルとして扱う）
          console.warn('reCAPTCHAスコアが低いですが、レビュー投稿を続行します');
        }
      } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        // エラーが発生しても続行（オプショナルとして扱う）
        console.warn('reCAPTCHA検証中にエラーが発生しましたが、レビュー投稿を続行します');
      }
    } else {
      // reCAPTCHAが設定されていない場合は何もログを出さない（正常な動作）
    }

    // バリデーション
    if (!playerId || typeof playerId !== 'string') {
      return NextResponse.json(
        { message: '選手IDが不正です' },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== 'string') {
      return NextResponse.json(
        { message: 'コメントが不正です' },
        { status: 400 }
      );
    }

    if (comment.length < 10 || comment.length > 500) {
      return NextResponse.json(
        { message: 'コメントは10文字以上500文字以内で入力してください' },
        { status: 400 }
      );
    }

    // ユーザー名の検証（任意）
    if (userName && typeof userName === 'string') {
      if (userName.length > 12) {
        return NextResponse.json(
          { message: 'ユーザー名は12文字以内で入力してください' },
          { status: 400 }
        );
      }
    }

    if (!scores || typeof scores !== 'object') {
      return NextResponse.json(
        { message: '評価データが不正です' },
        { status: 400 }
      );
    }

    // スコアの検証（すべて1-6の範囲内）
    const scoreValues = Object.values(scores);
    if (scoreValues.some((score) => typeof score !== 'number' || score < 1 || score > 6)) {
      return NextResponse.json(
        { message: '評価の値が不正です' },
        { status: 400 }
      );
    }

    // レート制限チェック
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      const resetTime = new Date(rateLimit.resetTime).toLocaleString('ja-JP');
      return NextResponse.json(
        { 
          message: `投稿制限に達しました。リセット時間: ${resetTime}`,
          resetTime: rateLimit.resetTime,
        },
        { status: 429 }
      );
    }

    // 総合評価を計算
    const overallScore = calculateAverageScore(scores);

    // レビューを作成（Admin SDK使用）- 15秒タイムアウト
    console.log('[API] Starting review creation with Admin SDK...');
    let reviewId: string;
    try {
      reviewId = await withTimeout(
        createReviewAdmin(playerId, comment, scores, overallScore, userName),
        15000 // 15秒タイムアウト
      );
      const elapsed = Date.now() - startTime;
      console.log(`[API] Review created successfully, reviewId: ${reviewId}, elapsed: ${elapsed}ms`);
    } catch (adminError) {
      console.error('[API] createReviewAdmin error:', adminError);
      
      // エラーメッセージを解析
      const errorMessage = adminError instanceof Error ? adminError.message : String(adminError);
      
      // クォータ超過エラー
      if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('Quota exceeded')) {
        throw new Error('現在サーバーが混み合っています。しばらく時間をおいてから再度お試しください。（クォータ制限）');
      }
      
      // タイムアウトエラー
      if (errorMessage.includes('タイムアウト')) {
        throw new Error('サーバーの応答に時間がかかっています。しばらく待ってから再度お試しください。');
      }
      
      throw new Error(
        adminError instanceof Error 
          ? adminError.message 
          : 'レビューの作成に失敗しました。Firebase Admin SDKの設定を確認してください。'
      );
    }

    const totalElapsed = Date.now() - startTime;
    console.log(`[API] Returning success response, total elapsed: ${totalElapsed}ms`);
    return NextResponse.json(
      {
        success: true,
        reviewId,
        message: 'レビューを投稿しました',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Review submission error:', error);
    
    // より詳細なエラーメッセージ
    let errorMessage = 'レビューの投稿に失敗しました';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Firebase Admin SDKの初期化エラーの場合
      if (error.message.includes('Firebase Admin SDK')) {
        errorMessage = 'サーバー設定エラー: Firebase Admin SDKが正しく設定されていません。管理者にお問い合わせください。';
      }
    }
    
    return NextResponse.json(
      {
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

// GETメソッド（将来的な拡張用）
export async function GET() {
  return NextResponse.json(
    { message: 'GET method is not supported for this endpoint' },
    { status: 405 }
  );
}

