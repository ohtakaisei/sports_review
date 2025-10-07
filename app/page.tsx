'use client';

import { useEffect, useState } from 'react';
import { getPlayers } from '@/lib/firebase/firestore';
import PlayerCard from '@/components/PlayerCard';
import PlayerFilter from '@/components/PlayerFilter';
import { Player } from '@/lib/types';

export default function HomePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ヒーローセクション */}
      <section className="gradient-bg py-20 text-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl animate-fade-in">
              NBA選手レビューサイト
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg sm:text-xl text-white/90 animate-fade-in">
              ファンの声で選手を応援しよう。あなたの評価が選手への最高のエールになる。
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm animate-fade-in">
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-6 py-3 backdrop-blur-sm">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>自由に閲覧</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-6 py-3 backdrop-blur-sm">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>匿名で投稿</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-6 py-3 backdrop-blur-sm">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>安心・安全</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 選手一覧セクション */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">選手一覧</h2>
            <p className="text-gray-600">
              気になる選手をクリックして、詳細な評価とレビューをチェック
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            </div>
          ) : players.length > 0 ? (
            <>
              {/* フィルター */}
              <PlayerFilter
                players={players}
                onFilterChange={setFilteredPlayers}
              />

              {/* 選手カード */}
              {filteredPlayers.length > 0 ? (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    {filteredPlayers.length}名の選手が見つかりました
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredPlayers.map((player) => (
                      <PlayerCard key={player.playerId} player={player} />
                    ))}
                  </div>
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
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    該当する選手が見つかりません
                  </h3>
                  <p className="text-sm text-gray-600">
                    検索条件を変更してみてください
                  </p>
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                まだ選手が登録されていません
              </h3>
              <p className="text-sm text-gray-600">
                Firestoreに選手データを追加してください
              </p>
            </div>
          )}
        </div>
      </section>

      {/* サイト説明セクション */}
      <section id="about" className="border-t bg-gray-50 py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
              Player Reviewとは
            </h2>
            <div className="space-y-6 text-gray-700">
              <div className="card p-6">
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  🏀 ファンによる、ファンのためのレビューサイト
                </h3>
                <p className="leading-relaxed">
                  NBA選手に対する評価や応援メッセージを、誰でも匿名で自由に投稿・閲覧できるプラットフォームです。
                  専門家の視点ではなく、ファンの熱い想いが詰まったレビューがここにあります。
                </p>
              </div>

              <div className="card p-6">
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  📊 16項目の詳細評価
                </h3>
                <p className="leading-relaxed">
                  オフェンス、ディフェンス、フィジカルなど、16の詳細な評価項目でS～Fランクの評価が可能。
                  レーダーチャートで選手の特徴が一目で分かります。
                </p>
              </div>

              <div className="card p-6">
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  🔒 安心・安全な投稿環境
                </h3>
                <p className="leading-relaxed">
                  Google reCAPTCHA v3によるスパム対策と、レート制限により、健全なコミュニティを維持。
                  匿名で気軽に、でも責任を持って投稿できる環境を提供します。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}