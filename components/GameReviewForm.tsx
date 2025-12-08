'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NBA_EVALUATION_ITEMS, ScoreGrade } from '@/lib/types';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { gradeToNumber } from '@/lib/utils';

const reviewSchema = z.object({
  comment: z.string().min(10, 'コメントは10文字以上で入力してください'),
  scores: z.record(z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F'])),
  userName: z.string().optional(),
});

interface GameReviewFormProps {
  gameId: string;
  playerId: string;
  playerName: string;
  parentReviewId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function GameReviewForm({
  gameId,
  playerId,
  playerName,
  parentReviewId,
  onSuccess,
  onCancel,
}: GameReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      comment: '',
      scores: {},
      userName: '',
    },
  });

  const currentScores = watch('scores');

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // reCAPTCHAトークンを取得
      if (!executeRecaptcha) {
        throw new Error('reCAPTCHAが利用できません');
      }

      const recaptchaToken = await executeRecaptcha('game_review_submit');
      if (!recaptchaToken) {
        throw new Error('reCAPTCHA認証に失敗しました');
      }

      // スコアを数値に変換
      const numericScores: Record<string, number> = {};
      Object.entries(data.scores).forEach(([itemId, grade]) => {
        numericScores[itemId] = gradeToNumber(grade as ScoreGrade);
      });

      // 総合評価を計算
      const scores = Object.values(numericScores);
      const overallScore =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : 0;

      const response = await fetch(`/api/games/${gameId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          playerName,
          comment: data.comment,
          scores: numericScores,
          userName: data.userName || undefined,
          parentReviewId: parentReviewId || undefined,
          recaptchaToken,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'レビューの投稿に失敗しました');
      }

      onSuccess();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'レビューの投稿に失敗しました'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="mb-4 text-xl font-bold text-gray-900">
        {parentReviewId ? '返信を投稿' : `${playerName}のレビューを投稿`}
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 評価項目 */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            評価項目（S~F）
          </label>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {NBA_EVALUATION_ITEMS.map((item) => (
              <div key={item.itemId} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {item.name}
                </label>
                <select
                  {...register(`scores.${item.itemId}`)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  <option value="S">S</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* コメント */}
        <div>
          <label
            htmlFor="comment"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            コメント <span className="text-red-600">*</span>
          </label>
          <textarea
            {...register('comment')}
            id="comment"
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="この試合での選手のパフォーマンスについてコメントしてください"
          />
          {errors.comment && (
            <p className="mt-1 text-sm text-red-600">
              {errors.comment.message as string}
            </p>
          )}
        </div>

        {/* ユーザー名 */}
        <div>
          <label
            htmlFor="userName"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            ユーザー名（任意）
          </label>
          <input
            {...register('userName')}
            id="userName"
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="匿名で投稿する場合は空欄のまま"
          />
        </div>

        {/* エラー表示 */}
        {submitError && (
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? '投稿中...' : 'レビューを投稿'}
          </button>
        </div>
      </form>
    </div>
  );
}

