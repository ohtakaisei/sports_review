'use client';

import { useState } from 'react';
import { GameReview } from '@/lib/types';
import { formatRelativeTime, getGradeColor } from '@/lib/utils';
import GameReviewForm from './GameReviewForm';

interface GameReviewThreadProps {
  reviews: GameReview[];
  gameId: string;
  playerId: string;
  playerName: string;
  onReviewSubmit: () => void;
}

export default function GameReviewThread({
  reviews,
  gameId,
  playerId,
  playerName,
  onReviewSubmit,
}: GameReviewThreadProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // 親レビューと返信を分離
  const parentReviews = reviews.filter((r) => !r.parentReviewId);
  const replies = reviews.filter((r) => r.parentReviewId);

  // 返信を親レビューごとにグループ化
  const repliesByParent: Record<string, GameReview[]> = {};
  replies.forEach((reply) => {
    if (reply.parentReviewId) {
      if (!repliesByParent[reply.parentReviewId]) {
        repliesByParent[reply.parentReviewId] = [];
      }
      repliesByParent[reply.parentReviewId].push(reply);
    }
  });

  return (
    <div className="space-y-4">
      {parentReviews.length > 0 ? (
        parentReviews.map((review) => (
          <div key={review.reviewId} className="border-l-4 border-blue-500 pl-4">
            {/* 親レビュー */}
            <div className="card p-4">
              {/* ヘッダー */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {review.userName || '匿名ユーザー'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatRelativeTime(review.createdAt)}
                    </div>
                  </div>
                </div>

                {/* 総合評価 */}
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">総合評価</span>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-xl font-bold ${getGradeColor(review.overallGrade).split(' ')[0]}`}
                    >
                      {review.overallGrade}
                    </span>
                    <span className="text-xs text-gray-500">
                      {review.overallScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* コメント */}
              <div className="mb-3">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              </div>

              {/* 返信ボタン */}
              <button
                onClick={() =>
                  setReplyingTo(replyingTo === review.reviewId ? null : review.reviewId)
                }
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {replyingTo === review.reviewId ? '返信をキャンセル' : '返信する'}
              </button>
            </div>

            {/* 返信フォーム */}
            {replyingTo === review.reviewId && (
              <div className="ml-8 mt-3">
                <div className="card p-4 bg-gray-50">
                  <GameReviewForm
                    gameId={gameId}
                    playerId={playerId}
                    playerName={playerName}
                    parentReviewId={review.reviewId}
                    onSuccess={() => {
                      setReplyingTo(null);
                      onReviewSubmit();
                    }}
                    onCancel={() => setReplyingTo(null)}
                  />
                </div>
              </div>
            )}

            {/* 返信一覧 */}
            {repliesByParent[review.reviewId] &&
              repliesByParent[review.reviewId].length > 0 && (
                <div className="ml-8 mt-3 space-y-3">
                  {repliesByParent[review.reviewId].map((reply) => (
                    <div key={reply.reviewId} className="card p-3 bg-gray-50">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                            <svg
                              className="h-4 w-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {reply.userName || '匿名ユーザー'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatRelativeTime(reply.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-sm font-bold ${getGradeColor(reply.overallGrade).split(' ')[0]}`}
                          >
                            {reply.overallGrade}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{reply.comment}</p>
                    </div>
                  ))}
                </div>
              )}
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center py-4">
          まだレビューがありません。最初のレビューを投稿してください。
        </p>
      )}
    </div>
  );
}

