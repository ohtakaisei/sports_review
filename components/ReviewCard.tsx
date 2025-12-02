'use client';

import { Review, NBA_EVALUATION_ITEMS } from '@/lib/types';
import { numberToGrade, formatRelativeTime, getGradeColor } from '@/lib/utils';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const grade = numberToGrade(review.overallScore);

  return (
    <div className="card p-6 space-y-4 bg-white hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-sm text-white font-bold">
            {review.userName ? review.userName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {review.userName || '匿名ファン'}
            </h4>
            <p className="text-xs text-slate-500 font-medium">{formatRelativeTime(review.createdAt)}</p>
          </div>
        </div>
        
        {/* Overall Grade */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">総合評価</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold font-oswald ${getGradeColor(grade).split(' ')[0].replace('bg-', 'text-')}`}>
              {grade}
            </span>
            <span className="text-sm text-slate-400 font-medium">
              ({review.overallScore.toFixed(1)})
            </span>
          </div>
        </div>
      </div>

      {/* Comment */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
            {review.comment}
        </p>
      </div>

      {/* Detailed Scores */}
      <div className="pt-2">
        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">詳細評価</h5>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(review.scores).map(([itemId, score]) => {
            const itemGrade = numberToGrade(score);
            const item = NBA_EVALUATION_ITEMS.find(item => item.itemId === itemId);
            const displayName = item ? item.name : itemId;
            
            return (
              <div key={itemId} className="flex flex-col bg-slate-50 p-2 rounded border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold truncate mb-1">{displayName}</span>
                <div className="flex items-center justify-between">
                     <span className={`text-sm font-bold font-oswald ${getGradeColor(itemGrade).split(' ')[0].replace('bg-', 'text-')}`}>
                      {itemGrade}
                    </span>
                    {/* Tiny visual bar */}
                    <div className="h-1 w-8 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500" style={{ width: `${(score / 5) * 100}%` }}></div>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
