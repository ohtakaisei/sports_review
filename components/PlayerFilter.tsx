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

  // ユニークなチーム一覧を取得
  const teams = Array.from(new Set(players.map((p) => p.team))).sort();

  // ユニークなポジション一覧を取得
  const positions = Array.from(
    new Set(players.map((p) => p.position).filter((p): p is string => !!p))
  ).sort();

  // フィルタリング処理
  const handleFilter = (search: string, team: string, position: string) => {
    let filtered = players;

    // 名前検索
    if (search) {
      filtered = filtered.filter((player) =>
        player.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // チームフィルター
    if (team !== 'all') {
      filtered = filtered.filter((player) => player.team === team);
    }

    // ポジションフィルター
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
    <div className="mb-8 space-y-4">
      {/* 検索バー */}
      <div className="relative">
        <input
          type="text"
          placeholder="選手名で検索..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
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

      {/* フィルター */}
      <div className="flex flex-wrap gap-4">
        {/* チームフィルター */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="team-filter" className="mb-2 block text-sm font-medium text-gray-700">
            チーム
          </label>
          <select
            id="team-filter"
            value={selectedTeam}
            onChange={(e) => handleTeamChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">すべてのチーム</option>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>

        {/* ポジションフィルター */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="position-filter" className="mb-2 block text-sm font-medium text-gray-700">
            ポジション
          </label>
          <select
            id="position-filter"
            value={selectedPosition}
            onChange={(e) => handlePositionChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">すべてのポジション</option>
            {positions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        {/* クリアボタン */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              クリア
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

