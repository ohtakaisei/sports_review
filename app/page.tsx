'use client';

import { useEffect, useState } from 'react';
import { getPlayers } from '@/lib/firebase/firestore';
import PlayerCard from '@/components/PlayerCard';
import PlayerFilter from '@/components/PlayerFilter';
import Pagination from '@/components/Pagination';
import { Player } from '@/lib/types';
import Link from 'next/link';

const PLAYERS_PER_PAGE = 12;

export default function HomePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const data = await getPlayers();
        setPlayers(data);
        setFilteredPlayers(data);
      } catch (error) {
        console.error('選手データの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const handleFilterChange = (filtered: Player[]) => {
    setFilteredPlayers(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredPlayers.length / PLAYERS_PER_PAGE);
  const startIndex = (currentPage - 1) * PLAYERS_PER_PAGE;
  const endIndex = startIndex + PLAYERS_PER_PAGE;
  const currentPlayers = filteredPlayers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-slate-900 py-24 sm:py-32 overflow-hidden">
         {/* Abstract Background */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-orange-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl"></div>

        <div className="container relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center rounded-full bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-400 ring-1 ring-inset ring-orange-500/20 mb-6 animate-fade-in">
            Next Gen Sports Analytics
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-7xl font-oswald animate-fade-in">
            PLAYER REVIEW
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300 leading-relaxed animate-fade-in delay-100">
            NBA選手のパフォーマンスを分析し、共有しよう。<br className="hidden sm:block"/>
            ファンの熱量とデータが交差する、新しいコミュニティプラットフォーム。
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in delay-200">
            <Link href="#roster" className="group relative flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-4 ring-1 ring-white/10 transition hover:bg-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
                <div className="text-left">
                    <div className="text-xs text-slate-400">View</div>
                    <div className="text-sm font-bold text-white">選手を見る</div>
                </div>
            </Link>

            <Link href="/about" className="group relative flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-4 ring-1 ring-white/10 transition hover:bg-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                     <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <div className="text-left">
                    <div className="text-xs text-slate-400">About</div>
                    <div className="text-sm font-bold text-white">サイトについて</div>
                </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Player List Section */}
      <section id="roster" className="py-20 -mt-10 relative z-10">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
           {/* Search/Filter Container - Floating Card Style */}
           <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 mb-12">
                <div className="mb-8 text-center sm:text-left sm:flex sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 font-oswald uppercase tracking-wide">ROSTER</h2>
                        <p className="text-slate-500 mt-2 text-sm">NBA選手のスタッツ、評価、コミュニティレビューを探索しましょう。</p>
                    </div>
                     {filteredPlayers.length > 0 && (
                      <div className="mt-4 sm:mt-0 text-sm font-medium text-slate-500 bg-slate-50 px-4 py-2 rounded-lg">
                        <span className="text-slate-900 font-bold">{filteredPlayers.length}</span> 名の選手を表示中
                      </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-orange-600"></div>
                    </div>
                ) : players.length > 0 ? (
                    <>
                    <PlayerFilter
                        players={players}
                        onFilterChange={handleFilterChange}
                    />
                    
                    {/* Spacer */}
                    <div className="h-8"></div>

                    {filteredPlayers.length > 0 ? (
                        <>
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {currentPlayers.map((player) => (
                            <PlayerCard key={player.playerId} player={player} />
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
                        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-16 text-center">
                            <div className="mx-auto h-12 w-12 text-slate-300 mb-4">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">選手が見つかりません</h3>
                            <p className="text-slate-500 mt-1">検索条件を変更して再度お試しください。</p>
                        </div>
                    )}
                    </>
                ) : (
                    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-16 text-center">
                        <h3 className="text-lg font-bold text-slate-900">データがありません</h3>
                        <p className="text-slate-500 mt-1">Firestoreに選手データを追加してください。</p>
                    </div>
                )}
           </div>
        </div>
      </section>

      {/* About Teaser Section */}
      <section className="bg-white py-24 border-t border-slate-100">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 font-oswald uppercase tracking-wide mb-4">
              About Player Review
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
                ファンの声で選手を応援しよう。あなたの評価が選手への最高のエールになる。<br/>
                Player Reviewは、ファンの集合知による究極の選手データベースを目指しています。
            </p>
            <Link href="/about" className="text-orange-600 font-bold hover:text-orange-700 hover:underline">
                詳しく見る →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
