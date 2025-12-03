'use client';

import { useEffect, useState } from 'react';
import { Player, Review } from '@/lib/types';
import { numberToGrade } from '@/lib/utils';
import { NBA_EVALUATION_ITEMS } from '@/lib/types';
import RadarChart from '@/components/RadarChart';
import ReviewCard from '@/components/ReviewCard';
import ReviewForm from '@/components/ReviewForm';
import Pagination from '@/components/Pagination';
import Link from 'next/link';
import { getPlayerReviews } from '@/lib/firebase/firestore';

const REVIEWS_PER_PAGE = 6;

interface PlayerDetailClientProps {
  initialPlayer: Player | null;
  initialReviews: Review[];
  playerId: string;
}

export default function PlayerDetailClient({ initialPlayer, initialReviews, playerId }: PlayerDetailClientProps) {
  const [player, setPlayer] = useState<Player | null>(initialPlayer);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loading, setLoading] = useState(!initialPlayer); // Initial player provided means not loading
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // If we didn't get initial data (e.g. error on server), we might want to fetch it client side,
  // but for now we assume server side fetching works or returns null if not found.
  // We still need to re-fetch reviews when a new one is posted or maybe for pagination if we implemented server-side pagination.
  // For this simple version, client-side pagination of initialReviews is fine if count is low, 
  // but let's keep the effect for consistency if we want to update data client-side later.
  // Actually, with initial data, we don't strictly need the initial useEffect fetch unless we want real-time updates.
  // Let's keep it simple: use initial data.

  useEffect(() => {
    setCurrentPage(1);
  }, [reviews]);

  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
  const endIndex = startIndex + REVIEWS_PER_PAGE;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Age Calculation
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

  // Refetch reviews only (since player update is handled via props mostly, or we could reload page)
  const refreshReviews = async () => {
      try {
          const newReviews = await getPlayerReviews(playerId);
          setReviews(newReviews);
          // Also could refresh player to get new stats if we had a fetchPlayer function exposed or just reload
          window.location.reload(); 
      } catch (e) {
          console.error(e);
      }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-orange-600"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">選手が見つかりません</h1>
          <Link href="/" className="text-orange-600 hover:text-orange-700 font-bold">ホームに戻る</Link>
        </div>
      </div>
    );
  }

  const summaryValues = Object.values(player.summary || {});
  const overallScore =
    summaryValues.length > 0
      ? summaryValues.reduce((acc, val) => acc + val, 0) / summaryValues.length
      : 0;
  const overallGrade = numberToGrade(overallScore);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": player.name,
    "jobTitle": player.position,
    "worksFor": {
      "@type": "SportsTeam",
      "name": player.team
    },
    "image": player.imageUrl,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": overallScore.toFixed(1),
      "ratingCount": player.reviewCount || 0,
      "bestRating": "6",
      "worstRating": "0"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-slate-50">
        
        {/* --- Hero Section --- */}
        <section className="relative bg-slate-900 text-white overflow-hidden">
           {/* Background Elements */}
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
           <div className="absolute top-0 right-0 -mt-40 -mr-40 w-[500px] h-[500px] rounded-full bg-orange-500/20 blur-3xl"></div>
           
           <div className="container mx-auto max-w-7xl px-6 py-12 lg:py-20 relative z-10">
             <div className="flex flex-col lg:flex-row gap-12 items-start">
                
                {/* Left Column: Image & Basic Info */}
                <div className="w-full lg:w-auto flex flex-col items-center lg:items-start gap-8">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative h-64 w-64 lg:h-80 lg:w-80 overflow-hidden rounded-xl bg-slate-800 ring-1 ring-white/10">
                            {player.imageUrl ? (
                            <img
                                src={player.imageUrl}
                                alt={player.name}
                                className="h-full w-full object-cover object-top"
                            />
                            ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-600">
                                <span className="text-8xl">👤</span>
                            </div>
                            )}
                        </div>
                        {/* Grade Badge Overlay */}
                         <div className="absolute -bottom-6 -right-6 w-24 h-24 flex items-center justify-center bg-slate-900 rounded-full border-4 border-slate-800 shadow-xl">
                             <div className="text-center">
                                 <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ランク</div>
                                 <div className={`text-5xl font-bold font-oswald ${overallGrade === 'S' ? 'text-purple-500' : overallGrade === 'A' ? 'text-blue-500' : overallGrade === 'B' ? 'text-green-500' : 'text-orange-500'}`}>
                                     {overallGrade}
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Middle Column: Stats & Details */}
                <div className="flex-1 w-full text-center lg:text-left">
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-sm font-bold text-slate-300">
                            {player.team}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-orange-600/20 border border-orange-600/30 text-sm font-bold text-orange-500">
                            {player.position}
                        </span>
                         <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-sm font-bold text-slate-300">
                            #{player.number}
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-oswald mb-8 tracking-wide">
                        {player.name}
                    </h1>

                    {/* Player Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10 text-left bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                        <div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">身長 / 体重</div>
                            <div className="font-bold text-lg">{player.height || '-'} / {player.weight || '-'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">生年月日</div>
                            <div className="font-bold text-lg">
                                {player.birthDate ? new Date(player.birthDate).toLocaleDateString('ja-JP') : '-'}
                                {player.birthDate && <span className="text-sm text-slate-400 ml-1">({calculateAge(player.birthDate)})</span>}
                            </div>
                        </div>
                         <div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">出身国</div>
                            <div className="font-bold text-lg">{player.country || '-'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">ドラフト</div>
                            <div className="font-bold text-lg">
                                {player.draftYear ? `${player.draftYear} - R${player.draftRound} (#${player.draftPick})` : 'Undrafted'}
                            </div>
                        </div>
                         <div className="col-span-2 sm:col-span-4 border-t border-slate-700 pt-4 mt-2">
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">契約</div>
                            <div className="font-bold text-xl text-green-400 font-mono">
                                {player.contractAmount 
                                    ? `$${player.contractAmount.toLocaleString()}` 
                                    : '-'}
                                {player.contractYears && <span className="text-sm text-slate-400 ml-2">/ {player.contractYears} 年</span>}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                        <button 
                            onClick={() => setShowReviewForm(true)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-orange-500/25 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            レビューを書く
                        </button>
                        <a href="#reviews-section" className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-full border border-slate-600 transition-all">
                            みんなの評価を見る ({player.reviewCount})
                        </a>
                        
                        {/* グッズ購入ボタン */}
                        {player.shopUrl && (
                            <a 
                                href={player.shopUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-white hover:bg-gray-50 text-slate-900 font-bold py-3 px-8 rounded-full border border-slate-300 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                選手のグッズを見る
                            </a>
                        )}
                    </div>
                </div>

                {/* Right Column: Season Stats */}
                {player.stats && (
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                             <div className="bg-slate-950 px-4 py-3 border-b border-slate-800">
                                <h3 className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    シーズンスタッツ ({player.stats.season})
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold font-oswald text-white">{player.stats.pts}</div>
                                    <div className="text-xs font-bold text-slate-500 uppercase">PTS</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                                     <div className="text-center">
                                        <div className="text-xl font-bold font-oswald text-white">{player.stats.reb}</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">REB</div>
                                    </div>
                                     <div className="text-center">
                                        <div className="text-xl font-bold font-oswald text-white">{player.stats.ast}</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">AST</div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-700 text-center">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">FG%</span>
                                        <span className="font-bold text-white">{player.stats.fg}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
             </div>
           </div>
        </section>

        {/* --- Analysis Section --- */}
        {Object.keys(player.summary || {}).length > 0 && (
            <section className="py-16 container mx-auto max-w-7xl px-6">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-12">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 font-oswald mb-4">コミュニティ分析</h2>
                            <p className="text-slate-600 leading-relaxed mb-8">
                                コミュニティによる16項目の詳細評価チャートです。<br/>
                                多くのファンの視点から、選手の強みと特徴が可視化されています。
                            </p>
                            
                            {/* Highlighted Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">総合スコア</div>
                                    <div className="text-3xl font-bold text-slate-900 font-oswald">{overallScore.toFixed(2)} / 6.0</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">総レビュー数</div>
                                    <div className="text-3xl font-bold text-slate-900 font-oswald">{player.reviewCount}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-center">
                             <div className="w-full max-w-md">
                                <RadarChart 
                                    labels={Object.keys(player.summary || {}).map(itemId => {
                                    const item = NBA_EVALUATION_ITEMS.find(item => item.itemId === itemId);
                                    return item ? item.name : itemId;
                                    })}
                                    data={Object.values(player.summary || {})}
                                    title={`${player.name}の分析`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )}

        {/* --- Review Form Section (Conditional) --- */}
        {showReviewForm && (
            <section className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-slate-900/80 backdrop-blur-sm">
                <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative animate-fade-in">
                    <button 
                        onClick={() => setShowReviewForm(false)}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="p-6 sm:p-8">
                        <h2 className="text-2xl font-bold text-slate-900 font-oswald mb-6">レビューを書く</h2>
                        <ReviewForm
                            playerId={playerId}
                            playerName={player.name}
                            onSuccess={() => {
                                setShowReviewForm(false);
                                // Refresh whole page to get new server side data and client state
                                window.location.reload();
                            }}
                        />
                    </div>
                </div>
            </section>
        )}

        {/* --- Reviews List Section --- */}
        <section id="reviews-section" className="py-16 bg-slate-50 border-t border-slate-200">
            <div className="container mx-auto max-w-7xl px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 font-oswald uppercase tracking-wide mb-2">ファンレビュー</h2>
                    <p className="text-slate-500">ファンのリアルな声</p>
                </div>

                {reviews.length > 0 ? (
                    <>
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {currentReviews.map((review) => (
                        <ReviewCard key={review.reviewId} review={review} />
                        ))}
                    </div>
                    
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                        </div>
                    )}
                    </>
                ) : (
                    <div className="max-w-lg mx-auto rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">まだレビューがありません</h3>
                        <p className="text-slate-500 mb-6">
                            この選手の最初のレビューを投稿して、<br/>コミュニティを盛り上げましょう！
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
    </>
  );
}

