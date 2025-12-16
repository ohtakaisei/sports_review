'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getGame, searchPlayers, getGameReviews } from '@/lib/firebase/firestore';
import { Game, Player, GameReview, ScoreGrade, SCORE_MAP } from '@/lib/types';

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<Game | null>(null);
  const [homePlayers, setHomePlayers] = useState<Player[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showReviewThread, setShowReviewThread] = useState(false);
  const [reviews, setReviews] = useState<Record<string, GameReview[]>>({});
  const [playerOverallGrades, setPlayerOverallGrades] = useState<Record<string, ScoreGrade>>({});
  const [overallGrade, setOverallGrade] = useState<ScoreGrade | null>(null);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 試合情報を取得
        const gameData = await getGame(gameId);
        if (!gameData) {
          console.error('試合が見つかりません');
          return;
        }
        setGame(gameData);

        // ホームチームとアウェイチームのロスターを取得
        const [homeRoster, awayRoster] = await Promise.all([
          searchPlayers({ team: gameData.homeTeam }),
          searchPlayers({ team: gameData.awayTeam }),
        ]);

        setHomePlayers(homeRoster);
        setAwayPlayers(awayRoster);

        // 各選手のレビューを取得
        const allPlayers = [...homeRoster, ...awayRoster];
        const reviewsMap: Record<string, GameReview[]> = {};
        const gradesMap: Record<string, ScoreGrade> = {};
        
        await Promise.all(
          allPlayers.map(async (player) => {
            const playerReviews = await getGameReviews(gameId, player.playerId);
            reviewsMap[player.playerId] = playerReviews;
            
            // その日の総合評価を計算
            if (playerReviews.length > 0) {
              const totalScore = playerReviews.reduce((sum, review) => sum + review.overallScore, 0);
              const averageScore = totalScore / playerReviews.length;
              // 平均スコアからグレードを計算
              const rounded = Math.round(averageScore);
              if (rounded >= 6) gradesMap[player.playerId] = 'S';
              else if (rounded >= 5) gradesMap[player.playerId] = 'A';
              else if (rounded >= 4) gradesMap[player.playerId] = 'B';
              else if (rounded >= 3) gradesMap[player.playerId] = 'C';
              else if (rounded >= 2) gradesMap[player.playerId] = 'D';
              else if (rounded >= 1) gradesMap[player.playerId] = 'E';
              else gradesMap[player.playerId] = 'F';
            }
          })
        );

        setReviews(reviewsMap);
        setPlayerOverallGrades(gradesMap);
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

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setShowReviewThread(true);
    // フォームをリセット
    setOverallGrade(null);
    setComment('');
    setUserName('');
  };

  const handleSubmitReview = async () => {
    if (!selectedPlayer || !game || !overallGrade) return;

    if (!comment.trim()) {
      alert('コメントを入力してください');
      return;
    }

    setSubmitting(true);

    try {
      // API Route経由でレビューを投稿（Admin SDK使用）
      const response = await fetch(`/api/games/${gameId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: selectedPlayer.playerId,
          playerName: selectedPlayer.name,
          comment,
          overallGrade,
          userName: userName || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'レビューの投稿に失敗しました');
      }

      // レビューを再取得
      const updatedReviews = await getGameReviews(gameId, selectedPlayer.playerId);
      setReviews((prev) => ({
        ...prev,
        [selectedPlayer.playerId]: updatedReviews,
      }));

      // 総合評価を再計算
      if (updatedReviews.length > 0) {
        const totalScore = updatedReviews.reduce((sum, review) => sum + review.overallScore, 0);
        const averageScore = totalScore / updatedReviews.length;
        const rounded = Math.round(averageScore);
        let newGrade: ScoreGrade = 'F';
        if (rounded >= 6) newGrade = 'S';
        else if (rounded >= 5) newGrade = 'A';
        else if (rounded >= 4) newGrade = 'B';
        else if (rounded >= 3) newGrade = 'C';
        else if (rounded >= 2) newGrade = 'D';
        else if (rounded >= 1) newGrade = 'E';
        
        setPlayerOverallGrades((prev) => ({
          ...prev,
          [selectedPlayer.playerId]: newGrade,
        }));
      }

      // フォームをリセット
      setOverallGrade(null);
      setComment('');
      setUserName('');

      alert('レビューを投稿しました！');
    } catch (error) {
      console.error('レビューの投稿に失敗しました:', error);
      alert('レビューの投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const formatDateForHeader = (dateString: string): { year: string; month: string; day: string; weekday: string } => {
    const date = new Date(dateString);
    return {
      year: date.getFullYear().toString(),
      month: (date.getMonth() + 1).toString().padStart(2, '0'),
      day: date.getDate().toString().padStart(2, '0'),
      weekday: date.toLocaleDateString('ja-JP', { weekday: 'short' }),
    };
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    return formatDate(dateString);
  };

  const getGradeColor = (grade: ScoreGrade): string => {
    switch (grade) {
      case 'S':
        return 'bg-purple-100 text-purple-800';
      case 'A':
        return 'bg-blue-100 text-blue-800';
      case 'B':
        return 'bg-green-100 text-green-800';
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
        return 'bg-orange-100 text-orange-800';
      case 'E':
        return 'bg-red-100 text-red-800';
      case 'F':
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-7xl px-4 py-16 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            試合が見つかりません
          </h1>
        </div>
      </div>
    );
  }

  const selectedPlayerReviews = selectedPlayer ? reviews[selectedPlayer.playerId] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ヘッダー */}
      <section className="gradient-bg py-12 text-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {(() => {
              const dateInfo = formatDateForHeader(game.date);
              return (
                <div className="mb-4">
                  <div className="mb-2 text-lg font-semibold text-white">
                    {dateInfo.year}年{dateInfo.month}月{dateInfo.day}日 ({dateInfo.weekday})
                  </div>
                </div>
              );
            })()}
            <h1 className="mb-6 text-3xl font-bold sm:text-4xl">
              {game.awayTeam} vs {game.homeTeam}
            </h1>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold">{game.awayScore}</div>
                <div className="mt-1 text-sm text-white/80">{game.awayTeam}</div>
              </div>
              <div className="text-2xl font-bold">-</div>
              <div className="text-center">
                <div className="text-2xl font-bold">{game.homeScore}</div>
                <div className="mt-1 text-sm text-white/80">{game.homeTeam}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ロスターとレビュー */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* アウェイチーム */}
            <div>
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                {game.awayTeam}
              </h2>
              <div className="space-y-2">
                {awayPlayers.length > 0 ? (
                  awayPlayers.map((player) => (
                    <div
                      key={player.playerId}
                      className="card p-4 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handlePlayerClick(player)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {player.imageUrl && (
                            <img
                              src={player.imageUrl}
                              alt={player.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {player.name}
                              </span>
                              {playerOverallGrades[player.playerId] && (
                                <span
                                  className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${getGradeColor(
                                    playerOverallGrades[player.playerId]
                                  )}`}
                                >
                                  {playerOverallGrades[player.playerId]}
                                </span>
                              )}
                            </div>
                            {player.position && (
                              <div className="text-sm text-gray-500">
                                {player.position}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {reviews[player.playerId]?.length || 0}件の評価
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                    <p className="text-gray-600">
                      {game.awayTeam}のロスターが見つかりませんでした。
                      <br />
                      データベースのチーム名と一致しているか確認してください。
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ホームチーム */}
            <div>
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                {game.homeTeam}
              </h2>
              <div className="space-y-2">
                {homePlayers.length > 0 ? (
                  homePlayers.map((player) => (
                    <div
                      key={player.playerId}
                      className="card p-4 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handlePlayerClick(player)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {player.imageUrl && (
                            <img
                              src={player.imageUrl}
                              alt={player.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {player.name}
                              </span>
                              {playerOverallGrades[player.playerId] && (
                                <span
                                  className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${getGradeColor(
                                    playerOverallGrades[player.playerId]
                                  )}`}
                                >
                                  {playerOverallGrades[player.playerId]}
                                </span>
                              )}
                            </div>
                            {player.position && (
                              <div className="text-sm text-gray-500">
                                {player.position}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {reviews[player.playerId]?.length || 0}件の評価
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                    <p className="text-gray-600">
                      {game.homeTeam}のロスターが見つかりませんでした。
                      <br />
                      データベースのチーム名と一致しているか確認してください。
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 評価スレッドモーダル */}
      {showReviewThread && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedPlayer.name} の評価スレッド
              </h2>
              <button
                onClick={() => {
                  setShowReviewThread(false);
                  setSelectedPlayer(null);
                  setOverallGrade(null);
                  setComment('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* 既存のレビュー（スレッド） */}
            <div className="mb-6 space-y-4">
              {selectedPlayerReviews.length > 0 ? (
                selectedPlayerReviews.map((review) => (
                  <div
                    key={review.reviewId}
                    className="rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {review.userName || '匿名'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${getGradeColor(
                            review.overallGrade
                          )}`}
                        >
                          {review.overallGrade}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(review.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                  <p className="text-gray-600">まだ評価がありません</p>
                </div>
              )}
            </div>

            {/* 新規レビュー投稿フォーム */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900">評価を投稿</h3>

              {/* 総合評価（S~F） */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  総合評価
                </label>
                <div className="flex gap-2">
                  {(['S', 'A', 'B', 'C', 'D', 'E', 'F'] as ScoreGrade[]).map(
                    (grade) => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setOverallGrade(grade)}
                        className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                          overallGrade === grade
                            ? `border-blue-600 bg-blue-50 text-blue-700 ${getGradeColor(grade)}`
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {grade}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* コメント */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  コメント
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="この試合での選手のパフォーマンスについてコメントしてください"
                />
              </div>

              {/* ユーザー名（任意） */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ユーザー名（任意）
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="匿名で投稿する場合は空欄のまま"
                />
              </div>

              {/* 送信ボタン */}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || !overallGrade || !comment.trim()}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? '投稿中...' : 'レビューを投稿'}
                </button>
                <button
                  onClick={() => {
                    setShowReviewThread(false);
                    setSelectedPlayer(null);
                    setOverallGrade(null);
                    setComment('');
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
