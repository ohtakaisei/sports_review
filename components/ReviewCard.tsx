'use client';

import { Review, NBA_EVALUATION_ITEMS } from '@/lib/types';
import { numberToGrade, formatRelativeTime, getGradeColor } from '@/lib/utils';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const grade = numberToGrade(review.overallScore);

  return (
    <div className="card p-6 space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <svg
              className="h-6 w-6 text-white"
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
            <h4 className="font-semibold text-gray-900">匿名ユーザー</h4>
            <p className="text-sm text-gray-500">{formatRelativeTime(review.createdAt)}</p>
          </div>
        </div>
        
        {/* 総合評価 */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">総合評価</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${getGradeColor(grade).split(' ')[0]}`}>
              {grade}
            </span>
            <span className="text-sm text-gray-500">
              {review.overallScore.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* コメント */}
      <div className="space-y-3">
        <h5 className="font-medium text-gray-900">コメント</h5>
        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
      </div>

      {/* 詳細評価 */}
      <div className="space-y-3">
        <h5 className="font-medium text-gray-900">詳細評価</h5>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(review.scores).map(([itemId, score]) => {
            const itemGrade = numberToGrade(score);
            const item = NBA_EVALUATION_ITEMS.find(item => item.itemId === itemId);
            const displayName = item ? item.name : itemId;
            
            return (
              <div key={itemId} className="flex justify-between items-center">
                <span className="text-gray-600">{displayName}</span>
                <span className={`font-medium ${getGradeColor(itemGrade).split(' ')[0]}`}>
                  {itemGrade}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
