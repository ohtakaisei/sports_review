'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import {
  NBA_EVALUATION_ITEMS,
  CATEGORY_LABELS,
  ScoreGrade,
  ReviewFormData,
  EvaluationCategory,
} from '@/lib/types';
import { getGradeColor, gradeToNumber } from '@/lib/utils';

const GRADES: ScoreGrade[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];

// バリデーションスキーマ
const reviewSchema = z.object({
  userName: z
    .string()
    .max(12, 'ユーザー名は12文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  comment: z
    .string()
    .min(10, 'コメントは10文字以上で入力してください')
    .max(500, 'コメントは500文字以内で入力してください'),
  scores: z.record(z.string(), z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F'])).refine(
    (scores) => {
      // すべての項目が評価されているかチェック
      return NBA_EVALUATION_ITEMS.every((item) => scores[item.itemId] !== undefined);
    },
    {
      message: 'すべての項目を評価してください',
    }
  ),
});

interface ReviewFormProps {
  playerId: string;
  playerName: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ playerId, playerName, onSuccess }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      comment: '',
      scores: {},
    },
  });

  const currentScores = watch('scores');

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // reCAPTCHAトークンを取得
      if (!executeRecaptcha) {
        throw new Error('reCAPTCHAが利用できません');
      }

      const recaptchaToken = await executeRecaptcha('review_submit');
      if (!recaptchaToken) {
        throw new Error('reCAPTCHA認証に失敗しました');
      }

      // スコアを数値に変換
      const numericScores: Record<string, number> = {};
      Object.entries(data.scores).forEach(([itemId, grade]) => {
        numericScores[itemId] = gradeToNumber(grade);
      });

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          comment: data.comment,
          scores: numericScores,
          recaptchaToken, // reCAPTCHAトークンを追加
          userName: data.userName || undefined, // ユーザー名を追加
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) {
          // レート制限エラーの場合、特別なメッセージを表示
          throw new Error(`投稿制限に達しました。${error.resetTime ? `リセット時間: ${new Date(error.resetTime).toLocaleString('ja-JP')}` : ''}`);
        }
        throw new Error(error.message || 'レビューの投稿に失敗しました');
      }

      setSubmitSuccess(true);
      reset();
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '予期しないエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // カテゴリごとにグループ化
  const groupedItems = NBA_EVALUATION_ITEMS.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<EvaluationCategory, typeof NBA_EVALUATION_ITEMS>);

  if (submitSuccess) {
    return (
      <div className="rounded-xl border-2 border-green-200 bg-green-50 p-8 text-center animate-fade-in">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h3 className="mb-2 text-xl font-bold text-green-900">
          レビューを投稿しました！
        </h3>
        <p className="text-green-700">
          {playerName}選手への応援メッセージをありがとうございます
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
      {/* ヘッダー */}
      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
          {playerName}選手のレビューを投稿
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-gray-600">
          各項目をS～Fで評価し、コメントを添えて投稿してください
        </p>
      </div>

      {/* 評価項目 */}
      <div className="space-y-4 sm:space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="card p-4 sm:p-6 space-y-3 sm:space-y-4">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900">
              {CATEGORY_LABELS[category as EvaluationCategory]}
            </h4>
            
            <div className="space-y-3 sm:space-y-4">
              {items.map((item) => (
                <div key={item.itemId} className="space-y-2">
                  <label className="flex items-center justify-between text-xs sm:text-sm font-medium text-gray-700">
                    <span className="truncate pr-2">{item.name}</span>
                    {currentScores[item.itemId] && (
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-bold flex-shrink-0 ${getGradeColor(currentScores[item.itemId])}`}
                      >
                        {currentScores[item.itemId]}
                      </span>
                    )}
                  </label>
                  
                  <div className="flex gap-1 sm:gap-2">
                    {GRADES.map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setValue(`scores.${item.itemId}`, grade, { shouldValidate: true })}
                        className={`flex-1 rounded-lg border-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold transition-all hover:scale-105 ${
                          currentScores[item.itemId] === grade
                            ? getGradeColor(grade) + ' border-current shadow-md scale-105'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {errors.scores && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {errors.scores.root?.message || 'すべての項目を評価してください'}
        </div>
      )}

      {/* ユーザー名入力 */}
      <div className="card p-4 sm:p-6 space-y-3 sm:space-y-4">
        <label htmlFor="userName" className="block text-base sm:text-lg font-semibold text-gray-900">
          ユーザー名 <span className="text-xs sm:text-sm font-normal text-gray-500">(任意)</span>
        </label>
        <input
          type="text"
          id="userName"
          {...register('userName')}
          placeholder="あなたの名前を入力してください（12文字以内）"
          maxLength={12}
          className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {errors.userName && (
          <p className="text-xs sm:text-sm text-red-600">{errors.userName.message}</p>
        )}
        <p className="text-xs text-gray-500">
          空の場合は「匿名ユーザー」として表示されます
        </p>
      </div>

      {/* コメント入力 */}
      <div className="card p-4 sm:p-6 space-y-3 sm:space-y-4">
        <label htmlFor="comment" className="block text-base sm:text-lg font-semibold text-gray-900">
          コメント
        </label>
        <textarea
          id="comment"
          {...register('comment')}
          rows={4}
          placeholder={`${playerName}選手への応援メッセージや評価の理由を自由に記入してください...`}
          className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
        />
        {errors.comment && (
          <p className="text-xs sm:text-sm text-red-600">{errors.comment.message}</p>
        )}
        <p className="text-xs text-gray-500">
          10文字以上500文字以内で入力してください
        </p>
      </div>

      {/* エラーメッセージ */}
      {submitError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 animate-fade-in">
          {submitError}
        </div>
      )}

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full text-sm sm:text-base py-3"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            投稿中...
          </span>
        ) : (
          'レビューを投稿する'
        )}
      </button>

      <p className="text-center text-xs text-gray-500 px-2">
        このサイトはreCAPTCHA v3で保護されており、Googleの
        <a href="https://policies.google.com/privacy" className="text-primary hover:underline">
          プライバシーポリシー
        </a>
        と
        <a href="https://policies.google.com/terms" className="text-primary hover:underline">
          利用規約
        </a>
        が適用されます。
      </p>
    </form>
  );
}

