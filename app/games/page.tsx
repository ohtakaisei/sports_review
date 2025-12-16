'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getGames } from '@/lib/firebase/firestore';
import { Game } from '@/lib/types';

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const data = await getGames(100);
        setGames(data);
      } catch (error) {
        console.error('試合一覧の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  // 日付をフォーマット
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ヘッダー */}
      <section className="gradient-bg py-12 text-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold sm:text-5xl">試合結果</h1>
            <p className="text-lg text-white/90">
              NBAの試合結果と選手のパフォーマンスをチェック
            </p>
          </div>
        </div>
      </section>

      {/* 試合一覧 */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            </div>
          ) : games.length > 0 ? (
            <div className="space-y-4">
              {games.map((game) => (
                <Link
                  key={game.gameId}
                  href={`/games/${game.gameId}`}
                  className="block"
                >
                  <div className="card p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                    {/* 日付 */}
                    <div className="mb-4 text-sm font-medium text-gray-500">
                      {formatDate(game.date)}
                    </div>

                    {/* スコア */}
                    <div className="flex items-center justify-between">
                      {/* アウェイチーム */}
                      <div className="flex-1 text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {game.awayTeam}
                        </div>
                        <div className="mt-2 text-3xl font-bold text-gray-700">
                          {game.awayScore}
                        </div>
                      </div>

                      {/* VS */}
                      <div className="mx-4 text-gray-400">VS</div>

                      {/* ホームチーム */}
                      <div className="flex-1 text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {game.homeTeam}
                        </div>
                        <div className="mt-2 text-3xl font-bold text-gray-700">
                          {game.homeScore}
                        </div>
                      </div>
                    </div>

                    {/* ステータス */}
                    <div className="mt-4 flex items-center justify-center">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          game.status === 'finished'
                            ? 'bg-green-100 text-green-800'
                            : game.status === 'live'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {game.status === 'finished'
                          ? '終了'
                          : game.status === 'live'
                          ? '試合中'
                          : '予定'}
                      </span>
                    </div>

                    {/* 詳細を見る */}
                    <div className="mt-4 text-center text-sm text-blue-600 hover:text-blue-800">
                      詳細を見る →
                    </div>
                  </div>
                </Link>
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                まだ試合結果が登録されていません
              </h3>
              <p className="text-sm text-gray-600">
                試合結果を登録すると、ここに表示されます
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}



