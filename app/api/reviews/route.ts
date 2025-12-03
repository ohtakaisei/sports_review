import { NextRequest, NextResponse } from 'next/server';
import { createReviewAdmin } from '@/lib/firebase/admin-firestore';
import { calculateAverageScore } from '@/lib/utils';
import { checkRateLimit } from '@/lib/utils/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, comment, scores, recaptchaToken, userName } = body;

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
      if (process.env.RECAPTCHA_SECRET_KEY && !recaptchaToken) {
        console.warn('RECAPTCHA_SECRET_KEY is configured but token is missing, skipping reCAPTCHA validation');
      } else if (!process.env.RECAPTCHA_SECRET_KEY) {
        console.log('RECAPTCHA_SECRET_KEY is not configured, skipping reCAPTCHA validation');
      }
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

    // レビューを作成（Admin SDK使用）
    let reviewId: string;
    try {
      reviewId = await createReviewAdmin(playerId, comment, scores, overallScore, userName);
    } catch (adminError) {
      console.error('createReviewAdmin error:', adminError);
      throw new Error(
        adminError instanceof Error 
          ? adminError.message 
          : 'レビューの作成に失敗しました。Firebase Admin SDKの設定を確認してください。'
      );
    }

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

