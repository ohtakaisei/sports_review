'use client';

import { useState } from 'react';
import { Review, NBA_EVALUATION_ITEMS } from '@/lib/types';
import { numberToGrade, formatRelativeTime, getGradeColor } from '@/lib/utils';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const grade = numberToGrade(review.overallScore);
  
  // 折りたたみ時は最初の2項目のみ表示
  const PREVIEW_ITEMS_COUNT = 2;
  const scoresEntries = Object.entries(review.scores);
  const previewScores = scoresEntries.slice(0, PREVIEW_ITEMS_COUNT);
  const remainingCount = scoresEntries.length - PREVIEW_ITEMS_COUNT;

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
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full mb-3 group hover:opacity-70 transition-opacity"
        >
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">詳細評価</h5>
          <span className="text-xs text-slate-400 font-medium">
            {isExpanded ? (
              <span className="flex items-center gap-1">
                折りたたむ
                <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                全て見る ({scoresEntries.length}項目)
                <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            )}
          </span>
        </button>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(isExpanded ? scoresEntries : previewScores).map(([itemId, score]) => {
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
        
        {/* 折りたたみ時のプレビュー表示（グレーアウト） */}
        {!isExpanded && remainingCount > 0 && (
          <div className="mt-3 relative">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 opacity-30 blur-[2px] pointer-events-none">
              {scoresEntries.slice(PREVIEW_ITEMS_COUNT, PREVIEW_ITEMS_COUNT + Math.min(2, remainingCount)).map(([itemId, score]) => {
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
                        <div className="h-1 w-8 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500" style={{ width: `${(score / 5) * 100}%` }}></div>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => setIsExpanded(true)}
                className="text-xs text-slate-400 font-medium bg-white/90 px-3 py-1.5 rounded-md shadow-sm border border-slate-200 hover:bg-white hover:text-slate-600 hover:border-slate-300 transition-colors cursor-pointer"
              >
                {remainingCount > 2 ? `+${remainingCount - 2}項目が続きます` : remainingCount === 2 ? '+2項目が続きます' : '+1項目が続きます'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
