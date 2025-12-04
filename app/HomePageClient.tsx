'use client';

import { useState } from 'react';
import PlayerCard from '@/components/PlayerCard';
import PlayerFilter from '@/components/PlayerFilter';
import Pagination from '@/components/Pagination';
import { Player } from '@/lib/types';

const PLAYERS_PER_PAGE = 12;

interface HomePageClientProps {
  initialPlayers: Player[];
}

export default function HomePageClient({ initialPlayers }: HomePageClientProps) {
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>(initialPlayers);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [isInitialState, setIsInitialState] = useState(true);

  const handleFilterChange = async (filtered: Player[], isSearch: boolean = false) => {
    if (isSearch) {
      setIsInitialState(false);
    }
    
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

              <PlayerFilter
                  initialPlayers={initialPlayers}
                  onFilterChange={handleFilterChange}
                  onSearchingChange={setIsSearching}
              />
              
              {/* Spacer */}
              <div className="h-8"></div>

              {isSearching ? (
                <div className="flex justify-center items-center py-12">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-orange-600"></div>
                </div>
              ) : filteredPlayers.length > 0 ? (
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
                      <p className="text-slate-500 mt-1">
                        {isInitialState 
                          ? '検索条件を入力して選手を探しましょう。'
                          : '検索条件を変更して再度お試しください。'}
                      </p>
                  </div>
              )}
         </div>
      </div>
    </section>
  );
}
