'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPlayer, getPlayerReviews } from '@/lib/firebase/firestore';
import { Player, Review } from '@/lib/types';
import { numberToGrade } from '@/lib/utils';
import { NBA_EVALUATION_ITEMS } from '@/lib/types';
import RadarChart from '@/components/RadarChart';
import ReviewCard from '@/components/ReviewCard';
import ReviewForm from '@/components/ReviewForm';

export default function PlayerDetailPage() {
  const params = useParams();
  const playerId = params.playerId as string;
  
  const [player, setPlayer] = useState<Player | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playerData, reviewsData] = await Promise.all([
          getPlayer(playerId),
          getPlayerReviews(playerId)
        ]);
        
        setPlayer(playerData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchData();
    }
  }, [playerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-7xl px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">選手が見つかりません</h1>
            <p className="text-gray-600 mb-8">指定された選手が存在しないか、削除された可能性があります。</p>
            <a href="/" className="btn-primary">ホームに戻る</a>
          </div>
        </div>
      </div>
    );
  }

  // 総合評価を計算
  const summaryValues = Object.values(player.summary || {});
  const overallScore =
    summaryValues.length > 0
      ? summaryValues.reduce((acc, val) => acc + val, 0) / summaryValues.length
      : 0;
  const overallGrade = numberToGrade(overallScore);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 選手ヘッダー */}
      <section className="gradient-bg py-8 sm:py-12 text-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
            {/* 選手画像 */}
            <div className="mb-6 sm:mb-8 lg:mb-0">
              <div className="relative h-48 w-48 sm:h-64 sm:w-64 mx-auto lg:mx-0 overflow-hidden rounded-2xl bg-white/20 backdrop-blur-sm">
                {player.imageUrl ? (
                  <img
                    src={player.imageUrl}
                    alt={player.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-6xl sm:text-8xl">👤</span>
                  </div>
                )}
              </div>
            </div>

            {/* 選手情報 */}
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-4 sm:mb-6">
                <h1 className="mb-2 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {player.name}
                </h1>
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 text-base sm:text-lg">
                  <span className="rounded-full bg-white/20 px-3 py-1.5 sm:px-4 sm:py-2 font-medium backdrop-blur-sm">
                    {player.team}
                  </span>
                  {player.position && (
                    <span className="rounded-full bg-white/20 px-3 py-1.5 sm:px-4 sm:py-2 font-medium backdrop-blur-sm">
                      {player.position}
                    </span>
                  )}
                </div>
              </div>

              {/* 総合評価 */}
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 lg:justify-start">
                <div className="text-center">
                  <p className="mb-1 text-xs sm:text-sm text-white/80">総合評価</p>
                  <div className="flex items-baseline gap-1 sm:gap-2">
                    <span className="text-4xl sm:text-6xl font-bold">{overallGrade}</span>
                    <span className="text-lg sm:text-2xl text-white/80">
                      {overallScore.toFixed(1)}
                    </span>
                  </div>
                </div>
                
                <div className="h-px w-16 sm:h-16 sm:w-px bg-white/30"></div>
                
                <div className="text-center">
                  <p className="mb-1 text-xs sm:text-sm text-white/80">レビュー数</p>
                  <div className="text-2xl sm:text-3xl font-bold">
                    {player.reviewCount || 0}
                  </div>
                  <span className="text-xs sm:text-sm text-white/80">件</span>
                </div>
              </div>

              {/* レビュー投稿ボタン */}
              <div className="flex justify-center lg:justify-start">
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="btn-primary bg-white text-primary hover:bg-gray-100"
                >
                  レビューを投稿する
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* レーダーチャート */}
      {Object.keys(player.summary || {}).length > 0 && (
        <section className="py-8 sm:py-16">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-12">
              <h2 className="mb-2 sm:mb-4 text-2xl sm:text-3xl font-bold text-gray-900">総合評価チャート</h2>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                ファンの評価を基にした16項目の詳細分析
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="w-full max-w-sm sm:max-w-md lg:max-w-2xl">
                <div className="aspect-square w-full">
                  <RadarChart 
                    labels={Object.keys(player.summary || {}).map(itemId => {
                      const item = NBA_EVALUATION_ITEMS.find(item => item.itemId === itemId);
                      return item ? item.name : itemId;
                    })}
                    data={Object.values(player.summary || {})}
                    title={`${player.name}の総合評価`}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* レビューフォーム */}
      {showReviewForm && (
        <section className="py-8 sm:py-16 bg-gray-50">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="card p-4 sm:p-8">
              <ReviewForm
                playerId={playerId}
                playerName={player.name}
                onSuccess={() => {
                  setShowReviewForm(false);
                  // データを再取得
                  window.location.reload();
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* レビュー一覧 */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-12 text-center">
            <h2 className="mb-2 sm:mb-4 text-2xl sm:text-3xl font-bold text-gray-900">ファンのレビュー</h2>
            <p className="text-sm sm:text-base text-gray-600">
              この選手に対するファンの声をお聞きください
            </p>
          </div>

          {reviews.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <ReviewCard key={review.reviewId} review={review} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                まだレビューがありません
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                最初のレビューを投稿してみませんか？
              </p>
              <button
                onClick={() => setShowReviewForm(true)}
                className="btn-primary"
              >
                レビューを投稿する
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
