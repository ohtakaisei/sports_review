import { NextRequest, NextResponse } from 'next/server';
import { createReviewAdmin } from '@/lib/firebase/admin-firestore';
import { calculateAverageScore } from '@/lib/utils';
import { checkRateLimit } from '@/lib/utils/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, comment, scores, recaptchaToken, userName } = body;

    // reCAPTCHA検証
    if (process.env.RECAPTCHA_SECRET_KEY) {
      if (!recaptchaToken) {
        console.error('reCAPTCHA token is missing');
        return NextResponse.json(
          { message: 'reCAPTCHA認証に失敗しました: トークンが取得できませんでした' },
          { status: 400 }
        );
      }

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
          return NextResponse.json(
            { 
              message: `reCAPTCHA認証に失敗しました: ${errorCodes.join(', ')}`,
              errorCodes 
            },
            { status: 400 }
          );
        }
        
        if (recaptchaData.score < 0.5) {
          console.warn('reCAPTCHA score too low:', recaptchaData.score);
          return NextResponse.json(
            { 
              message: `reCAPTCHA認証に失敗しました: スコアが低すぎます (${recaptchaData.score})`,
              score: recaptchaData.score 
            },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return NextResponse.json(
          { message: 'reCAPTCHA認証中にエラーが発生しました' },
          { status: 500 }
        );
      }
    } else {
      console.warn('RECAPTCHA_SECRET_KEY is not configured, skipping reCAPTCHA validation');
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
    const reviewId = await createReviewAdmin(playerId, comment, scores, overallScore, userName);

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
    
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'レビューの投稿に失敗しました',
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

