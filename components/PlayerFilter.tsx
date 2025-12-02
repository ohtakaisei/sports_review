'use client';

import { useState } from 'react';
import { Player } from '@/lib/types';

interface PlayerFilterProps {
  players: Player[];
  onFilterChange: (filteredPlayers: Player[]) => void;
}

export default function PlayerFilter({ players, onFilterChange }: PlayerFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');

  // Get unique teams
  const teams = Array.from(new Set(players.map((p) => p.team))).sort();

  // Get unique positions
  const positions = Array.from(
    new Set(players.map((p) => p.position).filter((p): p is string => !!p))
  ).sort();

  // Filter logic
  const handleFilter = (search: string, team: string, position: string) => {
    let filtered = players;

    if (search) {
      filtered = filtered.filter((player) =>
        player.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (team !== 'all') {
      filtered = filtered.filter((player) => player.team === team);
    }

    if (position !== 'all') {
      filtered = filtered.filter((player) => player.position === position);
    }

    onFilterChange(filtered);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    handleFilter(value, selectedTeam, selectedPosition);
  };

  const handleTeamChange = (value: string) => {
    setSelectedTeam(value);
    handleFilter(searchTerm, value, selectedPosition);
  };

  const handlePositionChange = (value: string) => {
    setSelectedPosition(value);
    handleFilter(searchTerm, selectedTeam, value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTeam('all');
    setSelectedPosition('all');
    onFilterChange(players);
  };

  const hasActiveFilters = searchTerm || selectedTeam !== 'all' || selectedPosition !== 'all';

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative group">
        <input
          type="text"
          placeholder="選手名で検索..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
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
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-8 text-slate-700 transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
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
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-8 text-slate-700 transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
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
              className="h-[42px] w-full sm:w-auto rounded-xl border-2 border-slate-200 px-6 text-sm font-bold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800"
            >
              クリア
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
