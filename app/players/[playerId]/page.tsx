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
          {/* デスクトップ: 横並びレイアウト */}
          <div className="hidden lg:flex lg:items-center lg:gap-12">
            {/* 左側: 選手画像と基本情報 */}
            <div className="flex items-center gap-8">
              {/* 選手画像 */}
              <div className="relative">
                <div className="relative h-64 w-64 overflow-hidden rounded-2xl bg-white/20 backdrop-blur-sm">
                  {player.imageUrl ? (
                    <img
                      src={player.imageUrl}
                      alt={player.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-8xl">👤</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 基本情報 */}
              <div className="flex-1">
                <div className="mb-6">
                  <h1 className="mb-3 text-4xl font-bold">
                    {player.name}
                  </h1>
                  <div className="flex items-center gap-4 text-lg mb-4">
                    <span className="rounded-full bg-white/20 px-4 py-2 font-medium backdrop-blur-sm">
                      {player.team}
                    </span>
                    {player.position && (
                      <span className="rounded-full bg-white/20 px-4 py-2 font-medium backdrop-blur-sm">
                        {player.position}
                      </span>
                    )}
                    {player.number && (
                      <span className="rounded-full bg-white/20 px-4 py-2 font-medium backdrop-blur-sm">
                        #{player.number}
                      </span>
                    )}
                  </div>
                  
                  {/* 基本情報 */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-base">
                    {player.height && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/80">身長/体重:</span>
                        <span className="text-white/90">{player.height}, {player.weight}</span>
                      </div>
                    )}
                    {player.birthDate && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/80">生年月日:</span>
                        <span className="text-white/90">
                          {new Date(player.birthDate).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric'
                          })} ({calculateAge(player.birthDate)}歳)
                        </span>
                      </div>
                    )}
                    {player.country && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/80">出身国:</span>
                        <span className="text-white/90">{player.country}</span>
                      </div>
                    )}
                    {player.draftYear && player.draftPick && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/80">ドラフト:</span>
                        <span className="text-white/90">{player.draftYear}年 {player.draftPick}位</span>
                      </div>
                    )}
                    {player.contractAmount && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/80">契約:</span>
                        <span className="text-white/90">
                          ${(player.contractAmount / 1000000).toFixed(1)}M
                          {player.contractYears && ` (${player.contractYears}年)`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 総合評価とレビュー数 */}
                <div className="mb-6 flex items-center gap-8">
                  <div className="text-center">
                    <p className="mb-1 text-sm text-white/80">総合評価</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold">{overallGrade}</span>
                      <span className="text-2xl text-white/80">
                        {overallScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-16 w-px bg-white/30"></div>
                  
                  <div className="text-center">
                    <p className="mb-1 text-sm text-white/80">レビュー数</p>
                    <div className="text-3xl font-bold">
                      {player.reviewCount || 0}
                    </div>
                    <span className="text-sm text-white/80">件</span>
                  </div>
                </div>

                {/* レビュー投稿ボタン */}
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="btn-primary bg-white text-primary hover:bg-gray-100"
                >
                  レビューを投稿する
                </button>
              </div>
            </div>

            {/* 右側: スタッツ情報 */}
            {player.stats && (
              <div className="ml-auto">
                <div className="rounded-2xl bg-white p-6 min-w-[280px] shadow-lg">
                  <h3 className="mb-4 text-center text-sm text-gray-600">
                    {player.stats.season}
                  </h3>
                  
                  <div className="flex justify-between gap-4">
                    {/* PTS */}
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {player.stats.pts}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">PTS</div>
                      <div className="text-xs text-gray-500">得点</div>
                    </div>
                    
                    {/* REB */}
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {player.stats.reb}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">REB</div>
                      <div className="text-xs text-gray-500">リバウンド</div>
                    </div>
                    
                    {/* AST */}
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {player.stats.ast}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">AST</div>
                      <div className="text-xs text-gray-500">アシスト</div>
                    </div>
                    
                    {/* FG% */}
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {player.stats.fg}%
                      </div>
                      <div className="text-xs text-gray-600 mb-1">FG%</div>
                      <div className="text-xs text-gray-500">FG成功率</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* モバイル: 縦並びレイアウト */}
          <div className="lg:hidden">
            {/* 選手画像 */}
            <div className="mb-6 text-center">
              <div className="relative h-48 w-48 mx-auto overflow-hidden rounded-2xl bg-white/20 backdrop-blur-sm">
                {player.imageUrl ? (
                  <img
                    src={player.imageUrl}
                    alt={player.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-6xl">👤</span>
                  </div>
                )}
              </div>
            </div>

            {/* 選手情報 */}
            <div className="text-center mb-6">
              <h1 className="mb-3 text-3xl font-bold">
                  {player.name}
                </h1>
              <div className="flex flex-wrap justify-center gap-2 text-base mb-4">
                <span className="rounded-full bg-white/20 px-3 py-1.5 font-medium backdrop-blur-sm">
                    {player.team}
                  </span>
                  {player.position && (
                  <span className="rounded-full bg-white/20 px-3 py-1.5 font-medium backdrop-blur-sm">
                      {player.position}
                    </span>
                  )}
                  {player.number && (
                  <span className="rounded-full bg-white/20 px-3 py-1.5 font-medium backdrop-blur-sm">
                      #{player.number}
                    </span>
                  )}
                </div>
                
              {/* 基本情報 */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  {player.height && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/80 whitespace-nowrap">身長/体重:</span>
                    <span className="text-white/90 text-xs">{player.height}, {player.weight}</span>
                    </div>
                  )}
                {player.birthDate && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/80 whitespace-nowrap">生年月日:</span>
                    <span className="text-white/90 text-xs">
                      {new Date(player.birthDate).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric'
                      })}
                    </span>
                    </div>
                  )}
                  {player.country && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/80 whitespace-nowrap">出身国:</span>
                    <span className="text-white/90 text-xs">{player.country}</span>
                  </div>
                )}
                {player.draftYear && player.draftPick && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/80 whitespace-nowrap">ドラフト:</span>
                    <span className="text-white/90 text-xs">{player.draftYear}年 {player.draftPick}位</span>
                    </div>
                  )}
                {player.contractAmount && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/80 whitespace-nowrap">契約:</span>
                    <span className="text-white/90 text-xs">
                      ${(player.contractAmount / 1000000).toFixed(1)}M
                      {player.contractYears && ` (${player.contractYears}年)`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

            {/* 総合評価とレビュー数 */}
            <div className="mb-6 flex items-center justify-center gap-6">
                <div className="text-center">
                <p className="mb-1 text-xs text-white/80">総合評価</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{overallGrade}</span>
                  <span className="text-lg text-white/80">
                      {overallScore.toFixed(1)}
                    </span>
                  </div>
                </div>
                
              <div className="h-12 w-px bg-white/30"></div>
                
                <div className="text-center">
                <p className="mb-1 text-xs text-white/80">レビュー数</p>
                <div className="text-2xl font-bold">
                    {player.reviewCount || 0}
                  </div>
                <span className="text-xs text-white/80">件</span>
                </div>
              </div>

              {/* レビュー投稿ボタン */}
            <div className="flex justify-center mb-6">
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="btn-primary bg-white text-primary hover:bg-gray-100"
                >
                  レビューを投稿する
                </button>
            </div>

            {/* スタッツ情報（モバイル） */}
            {player.stats && (
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-center text-sm text-gray-600">
                  {player.stats.season}
                </h3>
                
                <div className="flex justify-between gap-2">
                  {/* PTS */}
                  <div className="text-center flex-1">
                    <div className="text-xl font-bold text-gray-900 mb-1">
                      {player.stats.pts}
                    </div>
                    <div className="text-xs text-gray-600 mb-1">PTS</div>
                    <div className="text-xs text-gray-500">得点</div>
                  </div>
                  
                  {/* REB */}
                  <div className="text-center flex-1">
                    <div className="text-xl font-bold text-gray-900 mb-1">
                      {player.stats.reb}
                    </div>
                    <div className="text-xs text-gray-600 mb-1">REB</div>
                    <div className="text-xs text-gray-500">リバウンド</div>
                  </div>
                  
                  {/* AST */}
                  <div className="text-center flex-1">
                    <div className="text-xl font-bold text-gray-900 mb-1">
                      {player.stats.ast}
                    </div>
                    <div className="text-xs text-gray-600 mb-1">AST</div>
                    <div className="text-xs text-gray-500">アシスト</div>
                  </div>
                  
                  {/* FG% */}
                  <div className="text-center flex-1">
                    <div className="text-xl font-bold text-gray-900 mb-1">
                      {player.stats.fg}%
                    </div>
                    <div className="text-xs text-gray-600 mb-1">FG%</div>
                    <div className="text-xs text-gray-500">FG成功率</div>
                  </div>
              </div>
            </div>
            )}
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
        <section className="py-4 sm:py-8 bg-gray-50">
          <div className="container mx-auto max-w-4xl px-2 sm:px-4 lg:px-8">
            <div className="card p-3 sm:p-6 lg:p-8">
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
