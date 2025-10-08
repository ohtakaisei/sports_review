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
import Pagination from '@/components/Pagination';

const REVIEWS_PER_PAGE = 6; // 1ページあたりのレビュー数

export default function PlayerDetailPage() {
  const params = useParams();
  const playerId = params.playerId as string;
  
  const [player, setPlayer] = useState<Player | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

  // レビューが更新されたときにページをリセット
  useEffect(() => {
    setCurrentPage(1);
  }, [reviews]);

  // ページネーション用の計算
  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
  const endIndex = startIndex + REVIEWS_PER_PAGE;
  const currentReviews = reviews.slice(startIndex, endIndex);

  // ページ変更ハンドラー
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // レビューセクションにスクロール
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

  // 年齢の計算
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

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
                  {player.number && (
                    <span className="rounded-full bg-white/20 px-3 py-1.5 sm:px-4 sm:py-2 font-medium backdrop-blur-sm">
                      #{player.number}
                    </span>
                  )}
                </div>
                
                {/* 選手詳細情報 */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
                  {player.height && (
                    <div className="flex items-center justify-center lg:justify-start gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-white/90">{player.height}</span>
                    </div>
                  )}
                  {player.weight && (
                    <div className="flex items-center justify-center lg:justify-start gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-white/90">{player.weight}</span>
                    </div>
                  )}
                  {player.country && (
                    <div className="flex items-center justify-center lg:justify-start gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-white/90">{player.country}</span>
                    </div>
                  )}
                  {player.birthDate && (
                    <div className="flex items-center justify-center lg:justify-start gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-white/90">
                        {new Date(player.birthDate).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} ({calculateAge(player.birthDate)}歳)
                      </span>
                    </div>
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

              {/* ドラフト情報と契約情報 */}
              <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
                {player.draftYear && player.draftPick && (
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-white/90">
                      {player.draftYear}年 {player.draftPick}位
                    </span>
                  </div>
                )}
                {player.contractAmount && (
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="text-white/90">
                      ${(player.contractAmount / 1000000).toFixed(1)}M
                      {player.contractYears && ` (${player.contractYears}年)`}
                    </span>
                  </div>
                )}
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

      {/* スタッツ表示 */}
      {player.stats && (
        <section className="py-8 sm:py-16 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-12">
              <h2 className="mb-2 sm:mb-4 text-2xl sm:text-3xl font-bold text-gray-900">
                {player.stats.season} REGULAR SEASON STATS
              </h2>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                最新シーズンの統計データ
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* PTS */}
              <div className="card p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {player.stats.pts}
                </div>
                <div className="text-sm text-gray-600 mb-2">PTS</div>
                <div className="text-xs text-gray-500">Points</div>
              </div>
              
              {/* REB */}
              <div className="card p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {player.stats.reb}
                </div>
                <div className="text-sm text-gray-600 mb-2">REB</div>
                <div className="text-xs text-gray-500">Rebounds</div>
              </div>
              
              {/* AST */}
              <div className="card p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {player.stats.ast}
                </div>
                <div className="text-sm text-gray-600 mb-2">AST</div>
                <div className="text-xs text-gray-500">Assists</div>
              </div>
              
              {/* FG% */}
              <div className="card p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {player.stats.fg}%
                </div>
                <div className="text-sm text-gray-600 mb-2">FG%</div>
                <div className="text-xs text-gray-500">Field Goal %</div>
              </div>
            </div>
          </div>
        </section>
      )}

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
      <section id="reviews-section" className="py-8 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-12 text-center">
            <h2 className="mb-2 sm:mb-4 text-2xl sm:text-3xl font-bold text-gray-900">ファンのレビュー</h2>
            <p className="text-sm sm:text-base text-gray-600">
              この選手に対するファンの声をお聞きください
              {totalPages > 1 && (
                <span className="block mt-2 text-xs text-gray-500">
                  ページ {currentPage} / {totalPages} ({reviews.length}件中 {startIndex + 1}-{Math.min(endIndex, reviews.length)}件を表示)
                </span>
              )}
            </p>
          </div>

          {reviews.length > 0 ? (
            <>
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {currentReviews.map((review) => (
                  <ReviewCard key={review.reviewId} review={review} />
                ))}
              </div>
              
              {/* ページネーション */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
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
