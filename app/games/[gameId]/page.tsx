'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getGame, getGameReviews } from '@/lib/firebase/firestore';
import { Game, GameReview, GamePlayerStats } from '@/lib/types';
import GameReviewForm from '@/components/GameReviewForm';
import GameReviewThread from '@/components/GameReviewThread';

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<Game | null>(null);
  const [reviews, setReviews] = useState<GameReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gameData, reviewsData] = await Promise.all([
          getGame(gameId),
          getGameReviews(gameId),
        ]);

        setGame(gameData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchData();
    }
  }, [gameId]);

  // レビュー投稿後にデータを再取得
  const handleReviewSubmit = async () => {
    const reviewsData = await getGameReviews(gameId);
    setReviews(reviewsData);
    setShowReviewForm(false);
    setSelectedPlayer(null);
  };

  // 日付をフォーマット
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  // 選手をチーム別に分類
  const homePlayers = game?.players.filter((p) => p.team === 'home') || [];
  const awayPlayers = game?.players.filter((p) => p.team === 'away') || [];

  // 選手ごとのレビューをグループ化
  const reviewsByPlayer: Record<string, GameReview[]> = {};
  reviews.forEach((review) => {
    if (!reviewsByPlayer[review.playerId]) {
      reviewsByPlayer[review.playerId] = [];
    }
    reviewsByPlayer[review.playerId].push(review);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-7xl px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">試合が見つかりません</h1>
            <p className="text-gray-600 mb-8">指定された試合が存在しないか、削除された可能性があります。</p>
            <Link href="/games" className="btn-primary">試合一覧に戻る</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ヘッダー */}
      <section className="gradient-bg py-12 text-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/games" className="text-white/80 hover:text-white text-sm">
              ← 試合一覧に戻る
            </Link>
          </div>

          {/* 日付 */}
          <div className="mb-6 text-center text-sm text-white/80">
            {formatDate(game.date)}
          </div>

          {/* スコア */}
          <div className="flex items-center justify-center gap-8">
            {/* アウェイチーム */}
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold mb-2">{game.awayTeam}</div>
              <div className="text-5xl font-bold">{game.awayScore}</div>
            </div>

            {/* VS */}
            <div className="text-2xl text-white/60">VS</div>

            {/* ホームチーム */}
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold mb-2">{game.homeTeam}</div>
              <div className="text-5xl font-bold">{game.homeScore}</div>
            </div>
          </div>

          {/* ステータス */}
          <div className="mt-6 flex justify-center">
            <span
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                game.status === 'finished'
                  ? 'bg-green-500/20 text-green-100'
                  : game.status === 'live'
                  ? 'bg-red-500/20 text-red-100'
                  : 'bg-gray-500/20 text-gray-100'
              }`}
            >
              {game.status === 'finished'
                ? '試合終了'
                : game.status === 'live'
                ? '試合中'
                : '予定'}
            </span>
          </div>
        </div>
      </section>

      {/* 選手スタッツ */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 text-center">
            選手スタッツ
          </h2>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* アウェイチーム */}
            <div>
              <h3 className="mb-4 text-xl font-bold text-gray-900 text-center">
                {game.awayTeam}
              </h3>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                          選手名
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-700">
                          PTS
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-700">
                          AST
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-700">
                          REB
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-700">
                          FG%
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {awayPlayers.map((player) => (
                        <tr
                          key={player.playerId}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedPlayer(player.playerId);
                            setShowReviewForm(true);
                          }}
                        >
                          <td className="px-3 py-3 text-sm font-medium text-gray-900">
                            {player.name}
                          </td>
                          <td className="px-2 py-3 text-sm text-center text-gray-700">
                            {player.pts}
                          </td>
                          <td className="px-2 py-3 text-sm text-center text-gray-700">
                            {player.ast}
                          </td>
                          <td className="px-2 py-3 text-sm text-center text-gray-700">
                            {player.reb}
                          </td>
                          <td className="px-2 py-3 text-sm text-center text-gray-700">
                            {player.fg.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ホームチーム */}
            <div>
              <h3 className="mb-4 text-xl font-bold text-gray-900 text-center">
                {game.homeTeam}
              </h3>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                          選手名
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-700">
                          PTS
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-700">
                          AST
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-700">
                          REB
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-700">
                          FG%
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {homePlayers.map((player) => (
                        <tr
                          key={player.playerId}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedPlayer(player.playerId);
                            setShowReviewForm(true);
                          }}
                        >
                          <td className="px-3 py-3 text-sm font-medium text-gray-900">
                            {player.name}
                          </td>
                          <td className="px-2 py-3 text-sm text-center text-gray-700">
                            {player.pts}
                          </td>
                          <td className="px-2 py-3 text-sm text-center text-gray-700">
                            {player.ast}
                          </td>
                          <td className="px-2 py-3 text-sm text-center text-gray-700">
                            {player.reb}
                          </td>
                          <td className="px-2 py-3 text-sm text-center text-gray-700">
                            {player.fg.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* レビュー投稿フォーム */}
      {showReviewForm && selectedPlayer && (
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="card p-6">
              <GameReviewForm
                gameId={gameId}
                playerId={selectedPlayer}
                playerName={
                  [...homePlayers, ...awayPlayers].find(
                    (p) => p.playerId === selectedPlayer
                  )?.name || ''
                }
                onSuccess={handleReviewSubmit}
                onCancel={() => {
                  setShowReviewForm(false);
                  setSelectedPlayer(null);
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* レビュー一覧 */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 text-center">
            選手レビュー
          </h2>

          {reviews.length > 0 ? (
            <div className="space-y-6">
              {Object.keys(reviewsByPlayer).map((playerId) => {
                const playerReviews = reviewsByPlayer[playerId];
                const player = [...homePlayers, ...awayPlayers].find(
                  (p) => p.playerId === playerId
                );

                return (
                  <div key={playerId} className="card p-6">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                      {player?.name || '不明な選手'}
                    </h3>
                    <GameReviewThread
                      reviews={playerReviews}
                      gameId={gameId}
                      playerId={playerId}
                      playerName={player?.name || ''}
                      onReviewSubmit={handleReviewSubmit}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
              <p className="text-gray-600">
                まだレビューがありません。選手をクリックしてレビューを投稿してください。
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

