'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/lib/types';

interface PlayerFilterProps {
  initialPlayers: Player[];
  onFilterChange: (filteredPlayers: Player[], isSearch: boolean) => void;
  onSearchingChange?: (isSearching: boolean) => void;
}

export default function PlayerFilter({ initialPlayers, onFilterChange, onSearchingChange }: PlayerFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [teams, setTeams] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);

  // メタデータ（チーム/ポジションリスト）を取得
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch('/api/players/metadata');
        const data = await response.json();
        
        if (data.success) {
          setTeams(data.teams || []);
          setPositions(data.positions || []);
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
        // フォールバック: 初期選手から取得
        setTeams(Array.from(new Set(initialPlayers.map((p) => p.team))).sort());
        setPositions(
          Array.from(
            new Set(initialPlayers.map((p) => p.position).filter((p): p is string => !!p))
          ).sort()
        );
      }
    };
    
    fetchMetadata();
  }, [initialPlayers]);

  // 検索実行
  const executeSearch = async () => {
    // すべてのフィルタがクリアされた場合は初期状態に戻す
    if (!searchTerm && selectedTeam === 'all' && selectedPosition === 'all') {
      setHasSearched(false);
      onFilterChange(initialPlayers, false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    onSearchingChange?.(true);

    try {
      const params = new URLSearchParams();
      if (selectedTeam && selectedTeam !== 'all') {
        params.append('team', selectedTeam);
      }
      if (selectedPosition && selectedPosition !== 'all') {
        params.append('position', selectedPosition);
      }
      if (searchTerm && searchTerm.trim()) {
        params.append('name', searchTerm.trim());
      }

      // 検索条件がない場合は全選手を取得
      const response = await fetch(`/api/players/search?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        const players = data.players || [];
        onFilterChange(players, true);
      } else {
        console.error('Search failed:', data.error);
        onFilterChange([], true);
      }
    } catch (error) {
      console.error('Error searching players:', error);
      onFilterChange([], true);
    } finally {
      setIsSearching(false);
      onSearchingChange?.(false);
    }
  };

  // Enterキーで検索
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  };

  // チーム変更時の検索
  const handleTeamChange = (value: string) => {
    setSelectedTeam(value);
    // 検索が一度でも実行されていれば自動検索
    if (hasSearched || searchTerm || value !== 'all' || selectedPosition !== 'all') {
      setTimeout(() => executeSearch(), 0);
    }
  };

  // ポジション変更時の検索
  const handlePositionChange = (value: string) => {
    setSelectedPosition(value);
    // 検索が一度でも実行されていれば自動検索
    if (hasSearched || searchTerm || selectedTeam !== 'all' || value !== 'all') {
      setTimeout(() => executeSearch(), 0);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTeam('all');
    setSelectedPosition('all');
    setHasSearched(false);
    onFilterChange(initialPlayers, false);
  };

  const hasActiveFilters = searchTerm || selectedTeam !== 'all' || selectedPosition !== 'all';
  const canSearch = hasActiveFilters || hasSearched;

  return (
    <div className="space-y-4">
      {/* Search Bar with Search Button */}
      <div className="flex gap-3">
        <div className="relative group flex-1">
          <input
            type="text"
            placeholder="選手名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 placeholder-slate-400 transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
          />
          <svg
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button
          onClick={executeSearch}
          disabled={isSearching}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
        >
          {isSearching ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              検索中...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              検索
            </>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Team Filter */}
        <div className="flex-1">
          <label htmlFor="team-filter" className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wider">
            チーム
          </label>
          <div className="relative">
            <select
                id="team-filter"
                value={selectedTeam}
                onChange={(e) => handleTeamChange(e.target.value)}
                disabled={isSearching}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-8 text-slate-700 transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <option value="all">すべてのチーム</option>
                {teams.map((team) => (
                <option key={team} value={team}>
                    {team}
                </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
          </div>
        </div>

        {/* Position Filter */}
        <div className="flex-1">
          <label htmlFor="position-filter" className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wider">
            ポジション
          </label>
          <div className="relative">
            <select
                id="position-filter"
                value={selectedPosition}
                onChange={(e) => handlePositionChange(e.target.value)}
                disabled={isSearching}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-8 text-slate-700 transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <option value="all">すべてのポジション</option>
                {positions.map((position) => (
                <option key={position} value={position}>
                    {position}
                </option>
                ))}
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
          </div>
        </div>

        {/* Clear Button */}
        {hasActiveFilters && (
          <div className="flex items-end pb-0.5">
            <button
              onClick={clearFilters}
              disabled={isSearching}
              className="h-[42px] w-full sm:w-auto rounded-xl border-2 border-slate-200 px-6 text-sm font-bold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              クリア
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
