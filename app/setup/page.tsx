'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Player } from '@/lib/types';
import AddPlayerModal from './add-player-modal';

// サンプル選手データ
const SAMPLE_PLAYERS = [
  {
    playerId: "lebron-james",
    name: "レブロン・ジェームズ",
    team: "ロサンゼルス・レイカーズ",
    sport: "nba",
    position: "SF",
    number: 23,
    height: "206cm",
    weight: "113kg",
    birthDate: "1984年12月30日",
    country: "アメリカ",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png",
    reviewCount: 0,
    summary: {},
    // 新しいフィールドを追加
    draftYear: 2003,
    draftRound: 1,
    draftPick: 1,
    stats: {
      pts: 25.7,
      ast: 8.3,
      reb: 7.3,
      fg: 52.4,
      season: "2024-25"
    },
    contractAmount: 47607350,
    contractYears: 2
  },
  {
    playerId: "stephen-curry",
    name: "ステフィン・カリー",
    team: "ゴールデンステート・ウォリアーズ",
    sport: "nba",
    position: "PG",
    number: 30,
    height: "191cm",
    weight: "84kg",
    birthDate: "1988年3月14日",
    country: "アメリカ",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/201939.png",
    reviewCount: 0,
    summary: {},
    draftYear: 2009,
    draftRound: 1,
    draftPick: 7,
    stats: {
      pts: 26.4,
      ast: 5.1,
      reb: 4.5,
      fg: 45.0,
      season: "2024-25"
    },
    contractAmount: 55700000,
    contractYears: 4
  },
  {
    playerId: "kevin-durant",
    name: "ケビン・デュラント",
    team: "フェニックス・サンズ",
    sport: "nba",
    position: "PF",
    number: 35,
    height: "211cm",
    weight: "109kg",
    birthDate: "1988年9月29日",
    country: "アメリカ",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/201142.png",
    reviewCount: 0,
    summary: {},
    draftYear: 2007,
    draftRound: 1,
    draftPick: 2,
    stats: {
      pts: 27.1,
      ast: 5.0,
      reb: 6.7,
      fg: 52.3,
      season: "2024-25"
    },
    contractAmount: 51200000,
    contractYears: 4
  },
  {
    playerId: "giannis-antetokounmpo",
    name: "ヤニス・アデトクンボ",
    team: "ミルウォーキー・バックス",
    sport: "nba",
    position: "PF",
    number: 34,
    height: "211cm",
    weight: "110kg",
    birthDate: "1994年12月6日",
    country: "ギリシャ",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/203507.png",
    reviewCount: 0,
    summary: {},
    draftYear: 2013,
    draftRound: 1,
    draftPick: 15,
    stats: {
      pts: 30.4,
      ast: 6.5,
      reb: 11.5,
      fg: 55.3,
      season: "2024-25"
    },
    contractAmount: 45600000,
    contractYears: 3
  },
  {
    playerId: "luka-doncic",
    name: "ルカ・ドンチッチ",
    team: "ダラス・マーベリックス",
    sport: "nba",
    position: "PG",
    number: 77,
    height: "201cm",
    weight: "104kg",
    birthDate: "1999年2月28日",
    country: "スロベニア",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/1629029.png",
    reviewCount: 0,
    summary: {},
    draftYear: 2018,
    draftRound: 1,
    draftPick: 3,
    stats: {
      pts: 33.9,
      ast: 9.8,
      reb: 9.2,
      fg: 48.7,
      season: "2024-25"
    },
    contractAmount: 40000000,
    contractYears: 5
  },
  {
    playerId: "nikola-jokic",
    name: "ニコラ・ヨキッチ",
    team: "デンバー・ナゲッツ",
    sport: "nba",
    position: "C",
    number: 15,
    height: "213cm",
    weight: "129kg",
    birthDate: "1995年2月19日",
    country: "セルビア",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/203999.png",
    reviewCount: 0,
    summary: {},
    draftYear: 2014,
    draftRound: 2,
    draftPick: 41,
    stats: {
      pts: 26.4,
      ast: 9.0,
      reb: 12.4,
      fg: 58.3,
      season: "2024-25"
    },
    contractAmount: 51400000,
    contractYears: 5
  }
];

export default function SetupPage() {
  // 認証状態
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'sample' | 'json'>('sample');
  const [managementMode, setManagementMode] = useState<'add' | 'manage' | 'games'>('add');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 選手管理用のstate
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null);
  
  // 検索・フィルター用のstate
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  
  // 試合結果取得用のstate
  const [fetchingGame, setFetchingGame] = useState(false);
  const [gameFetchResult, setGameFetchResult] = useState<{ success: boolean; message: string; gameId?: string } | null>(null);
  const [gameInputMode, setGameInputMode] = useState<'today' | 'manual'>('today');
  const [manualGameDate, setManualGameDate] = useState('');
  const [manualHomeTeam, setManualHomeTeam] = useState('');
  const [manualAwayTeam, setManualAwayTeam] = useState('');
  
  // 試合結果管理用のstate
  const [games, setGames] = useState<any[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [editingGame, setEditingGame] = useState<any | null>(null);
  const [deletingGame, setDeletingGame] = useState<any | null>(null);
  const [gameViewMode, setGameViewMode] = useState<'fetch' | 'manage'>('fetch');
  
  // ページネーション用のstate
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12; // 1ページあたり12人表示

  // 認証チェック（初回マウント時）
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('admin_auth_token');
      if (authToken === 'authenticated') {
        setIsAuthenticated(true);
      }
      setCheckingAuth(false);
    };
    checkAuth();
  }, []);

  // パスワード認証
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    try {
      const response = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // 認証成功
        localStorage.setItem('admin_auth_token', 'authenticated');
        setIsAuthenticated(true);
        setPassword('');
      } else {
        const errorData = await response.json();
        setAuthError(errorData.error || 'パスワードが正しくありません');
        setPassword('');
      }
    } catch (err) {
      console.error('認証エラー:', err);
      setAuthError('認証に失敗しました');
    }
  };

  // ログアウト
  const handleLogout = () => {
    localStorage.removeItem('admin_auth_token');
    setIsAuthenticated(false);
    setPassword('');
  };

  // 選手一覧を取得
  const fetchPlayers = async () => {
    setLoadingPlayers(true);
    try {
      const playersSnapshot = await getDocs(collection(db, 'players'));
      const playersList: Player[] = [];
      playersSnapshot.forEach((doc) => {
        playersList.push(doc.data() as Player);
      });
      // 名前順でソート
      playersList.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
      setPlayers(playersList);
    } catch (err) {
      console.error('選手データの取得に失敗:', err);
      setError('選手データの取得に失敗しました');
    } finally {
      setLoadingPlayers(false);
    }
  };

  // 試合結果一覧を取得
  const fetchGames = async () => {
    setLoadingGames(true);
    try {
      const { getGames } = await import('@/lib/firebase/firestore');
      const gamesList = await getGames(100);
      setGames(gamesList);
    } catch (err) {
      console.error('試合結果データの取得に失敗:', err);
      setError('試合結果データの取得に失敗しました');
    } finally {
      setLoadingGames(false);
    }
  };

  // 試合結果を更新
  const handleUpdateGame = async (gameData: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/games/${editingGame?.gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '試合結果の更新に失敗しました');
      }

      setEditingGame(null);
      await fetchGames();
      setGameFetchResult({
        success: true,
        message: '試合結果を更新しました',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '試合結果の更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 試合結果を削除
  const handleDeleteGame = async () => {
    if (!deletingGame) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/games/${deletingGame.gameId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '試合結果の削除に失敗しました');
      }

      setDeletingGame(null);
      await fetchGames();
      setGameFetchResult({
        success: true,
        message: '試合結果を削除しました',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '試合結果の削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // managementModeに切り替えた時に選手一覧を取得
  useEffect(() => {
    if (managementMode === 'manage') {
      fetchPlayers();
    } else if (managementMode === 'games') {
      fetchGames();
    }
  }, [managementMode]);

  // フィルター処理
  const filteredPlayers = players.filter((player) => {
    // 名前検索
    if (searchTerm && !player.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // チームフィルター
    if (selectedTeam !== 'all' && player.team !== selectedTeam) {
      return false;
    }
    
    // ポジションフィルター
    if (selectedPosition !== 'all' && player.position !== selectedPosition) {
      return false;
    }
    
    return true;
  });

  // ページネーション計算
  const totalPages = Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPlayers = filteredPlayers.slice(startIndex, endIndex);

  // フィルター変更時にページを1に戻す
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTeam, selectedPosition]);

  // ユニークなチーム一覧を取得
  const teams = Array.from(new Set(players.map((p) => p.team))).sort();

  // ユニークなポジション一覧を取得
  const positions = Array.from(
    new Set(players.map((p) => p.position).filter((p): p is string => !!p))
  ).sort();

  // フィルタークリア
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTeam('all');
    setSelectedPosition('all');
  };

  const hasActiveFilters = searchTerm || selectedTeam !== 'all' || selectedPosition !== 'all';

  const addPlayers = async (players: Array<Record<string, unknown>>) => {
    setLoading(true);
    setResult(null);
    setError(null);

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      for (const player of players) {
        try {
          // 必須フィールドのバリデーション
          if (!player.playerId || !player.name || !player.team) {
            throw new Error('必須フィールド（playerId, name, team）が不足しています');
          }

          // デフォルト値を設定
          const playerData = {
            playerId: player.playerId,
            name: player.name,
            team: player.team,
            sport: player.sport || 'nba',
            position: player.position || '',
            number: player.number || null,
            height: player.height || '',
            weight: player.weight || '',
            birthDate: player.birthDate || '',
            country: player.country || '',
            imageUrl: player.imageUrl || '',
            reviewCount: player.reviewCount || 0,
            summary: player.summary || {},
            rank: player.rank || 'F', // 総合ランク（初期値: F）
            // 新しいフィールドを追加
            draftYear: player.draftYear || null,
            draftRound: player.draftRound || null,
            draftPick: player.draftPick || null,
            stats: player.stats || null,
            contractAmount: player.contractAmount || null,
            contractYears: player.contractYears || null,
            shopUrl: player.shopUrl || null
          };

          const playerRef = doc(db, 'players', String(player.playerId));
          await setDoc(playerRef, playerData);
          success++;
          console.log(`✅ ${player.name} を追加しました`);
        } catch (err) {
          failed++;
          const errorMsg = `${player.name || 'Unknown'}: ${err instanceof Error ? err.message : String(err)}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      setResult({ success, failed, errors });
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const addSampleData = async () => {
    await addPlayers(SAMPLE_PLAYERS);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const players = JSON.parse(text);
      
      if (!Array.isArray(players)) {
        throw new Error('JSONファイルは配列形式である必要があります');
      }

      await addPlayers(players);
    } catch (err) {
      setError(`ファイルの読み込みに失敗しました: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // 選手情報を更新
  const handleUpdatePlayer = async (updatedPlayer: Player) => {
    setLoading(true);
    setError(null);
    
    try {
      // API Route経由で更新（Admin SDK使用）
      const response = await fetch('/api/players', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPlayer),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '選手の更新に失敗しました');
      }

      const result = await response.json();
      
      // ローカルの状態を更新
      setPlayers(players.map(p => p.playerId === updatedPlayer.playerId ? result.player : p));
      setEditingPlayer(null);
      alert('✅ 選手情報を更新しました');
    } catch (err) {
      console.error('更新エラー:', err);
      setError(`更新に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // 選手を削除
  const handleDeletePlayer = async (player: Player) => {
    setLoading(true);
    setError(null);
    
    try {
      // API Route経由で削除（Admin SDK使用）
      const response = await fetch(`/api/players?playerId=${encodeURIComponent(player.playerId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '選手の削除に失敗しました');
      }
      
      // ローカルの状態を更新
      setPlayers(players.filter(p => p.playerId !== player.playerId));
      setDeletingPlayer(null);
      alert(`✅ ${player.name} を削除しました`);
    } catch (err) {
      console.error('削除エラー:', err);
      setError(`削除に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // 選手を新規追加
  const handleAddPlayer = async (newPlayer: Omit<Player, 'playerId'> & { playerId: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      // 必須フィールドのバリデーション
      if (!newPlayer.playerId || !newPlayer.name || !newPlayer.team) {
        throw new Error('必須フィールド（playerId, name, team）が不足しています');
      }

      // デフォルト値を設定
      const playerData: Player = {
        playerId: newPlayer.playerId,
        name: newPlayer.name,
        team: newPlayer.team,
        sport: newPlayer.sport || 'nba',
        position: newPlayer.position || '',
        number: newPlayer.number || null,
        height: newPlayer.height || '',
        weight: newPlayer.weight || '',
        birthDate: newPlayer.birthDate || '',
        country: newPlayer.country || '',
        imageUrl: newPlayer.imageUrl || '',
        reviewCount: 0,
        summary: {},
        rank: 'F',
        draftYear: newPlayer.draftYear || null,
        draftRound: newPlayer.draftRound || null,
        draftPick: newPlayer.draftPick || null,
        stats: newPlayer.stats || null,
        contractAmount: newPlayer.contractAmount || null,
        contractYears: newPlayer.contractYears || null,
        shopUrl: newPlayer.shopUrl || null,
      };

      // API Route経由で追加（Admin SDK使用）
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '選手の追加に失敗しました');
      }

      const result = await response.json();
      
      // ローカルの状態を更新
      setPlayers([...players, result.player]);
      setAddingPlayer(false);
      alert(`✅ ${result.player.name} を追加しました`);
    } catch (err) {
      console.error('追加エラー:', err);
      setError(`追加に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // 認証チェック中
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  // 認証されていない場合、パスワード入力画面を表示
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <div className="mb-6 text-center">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">管理者認証</h1>
              <p className="text-sm text-gray-600">このページにアクセスするにはパスワードが必要です</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="パスワードを入力"
                />
              </div>

              {authError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-800">{authError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                認証
              </button>
            </form>

            <div className="mt-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-xs text-yellow-800">
                <strong>⚠️ 注意:</strong> このページは管理者専用です。パスワードは環境変数 <code className="bg-yellow-100 px-1 rounded">ADMIN_PASSWORD</code> で設定してください。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">選手管理画面</h1>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ログアウト
            </button>
          </div>
          <p className="text-gray-600">選手の追加・編集・削除</p>
        </div>

        {/* 注意事項 */}
        <div className="card mb-8 border-2 border-yellow-200 bg-yellow-50 p-6">
          <h3 className="mb-3 text-lg font-semibold text-yellow-900">⚠️ 重要な注意事項</h3>
          <div className="space-y-2 text-sm text-yellow-800">
            <p className="font-medium">このページを使用する前に、Firestoreセキュリティルールを一時的に変更してください：</p>
            <div className="rounded-lg bg-yellow-100 p-4 font-mono text-xs">
              <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{playerId} {
      allow read: if true;
      allow write: if true;  // ← ここをtrueに変更
    }
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if false;
    }
  }
}`}</pre>
            </div>
            <p className="mt-3 font-medium text-red-700">
              ⚠️ 操作後は、必ず `allow write: if false;` に戻してください！
            </p>
          </div>
        </div>

        {/* モード切り替えタブ */}
        <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setManagementMode('add')}
            className={`flex-1 rounded-md px-4 py-3 text-base font-medium transition-colors ${
              managementMode === 'add'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ➕ 選手を追加
          </button>
          <button
            onClick={() => setManagementMode('manage')}
            className={`flex-1 rounded-md px-4 py-3 text-base font-medium transition-colors ${
              managementMode === 'manage'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📝 選手を管理
          </button>
          <button
            onClick={() => setManagementMode('games')}
            className={`flex-1 rounded-md px-4 py-3 text-base font-medium transition-colors ${
              managementMode === 'games'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏀 試合結果取得
          </button>
        </div>

        {/* 選手追加モード */}
        {managementMode === 'add' && (
          <div className="card p-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">選手データの追加</h2>
          
          {/* タブ切り替え */}
          <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setImportMode('sample')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                importMode === 'sample'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 サンプルデータ
            </button>
            <button
              onClick={() => setImportMode('json')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                importMode === 'json'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📁 JSONファイル
            </button>
          </div>

          {/* サンプルデータタブ */}
          {importMode === 'sample' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">以下の6名の選手データを追加します：</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {SAMPLE_PLAYERS.map((player) => (
                    <li key={player.playerId} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-blue-600">•</span>
                      <span>{player.name} ({player.team})</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={addSampleData}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    追加中...
                  </span>
                ) : (
                  '🏀 サンプルデータを追加'
                )}
              </button>
            </div>
          )}

          {/* JSONファイルタブ */}
          {importMode === 'json' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-blue-900">📝 JSONファイル形式</h3>
                  <p className="mb-3 text-sm text-blue-800">
                    以下の形式でJSONファイルを作成してください：
                  </p>
                  <div className="rounded bg-blue-100 p-3 font-mono text-xs">
                    <pre>{`[
  {
    "playerId": "player-unique-id",
    "name": "選手名",
    "team": "チーム名",
    "position": "ポジション",
    "number": 背番号,
    "height": "身長",
    "weight": "体重",
    "birthDate": "生年月日",
    "country": "国籍",
    "imageUrl": "画像URL"
  }
]`}</pre>
                  </div>
                </div>

                <div className="rounded-lg bg-green-50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-green-900">✅ 必須フィールド</h3>
                  <ul className="space-y-1 text-sm text-green-800">
                    <li>• <code className="rounded bg-green-200 px-1">playerId</code> - 一意のID</li>
                    <li>• <code className="rounded bg-green-200 px-1">name</code> - 選手名</li>
                    <li>• <code className="rounded bg-green-200 px-1">team</code> - チーム名</li>
                  </ul>
                </div>

                <div className="rounded-lg bg-yellow-50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-yellow-900">📋 テンプレートファイル</h3>
                  <p className="mb-3 text-sm text-yellow-800">
                    テンプレートファイルをダウンロードして編集してください：
                  </p>
                  <a
                    href="/api/download-template"
                    className="inline-flex items-center gap-2 rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
                  >
                    📥 テンプレートをダウンロード
                  </a>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      追加中...
                    </span>
                  ) : (
                    '📁 JSONファイルを選択して追加'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* 選手管理モード */}
        {managementMode === 'manage' && (
          <div className="space-y-6">
            {/* ヘッダーと更新ボタン */}
            <div className="card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">登録済み選手一覧</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    全 {players.length} 名 {filteredPlayers.length !== players.length && `(${filteredPlayers.length} 名を表示中)`}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAddingPlayer(true)}
                    className="btn-primary whitespace-nowrap"
                  >
                    ➕ 新規追加
                  </button>
                  <button
                    onClick={fetchPlayers}
                    disabled={loadingPlayers}
                    className="btn-secondary whitespace-nowrap"
                  >
                    {loadingPlayers ? '読み込み中...' : '🔄 更新'}
                  </button>
                </div>
              </div>
            </div>

            {/* 検索・フィルター */}
            {!loadingPlayers && players.length > 0 && (
              <div className="card p-6 space-y-4">
                {/* 検索バー */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="選手名で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                      onChange={(e) => setSelectedTeam(e.target.value)}
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
                      onChange={(e) => setSelectedPosition(e.target.value)}
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
            )}

            {/* 選手リスト */}
            {loadingPlayers ? (
              <div className="card p-12 text-center">
                <div className="flex items-center justify-center gap-3">
                  <svg className="h-8 w-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-lg text-gray-600">データを読み込んでいます...</span>
                </div>
              </div>
            ) : players.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-lg text-gray-600">登録されている選手がいません</p>
                <p className="mt-2 text-sm text-gray-500">「選手を追加」タブから選手を追加してください</p>
              </div>
            ) : filteredPlayers.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-lg text-gray-600">該当する選手が見つかりません</p>
                <p className="mt-2 text-sm text-gray-500">検索条件を変更してください</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  フィルターをクリア
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {currentPlayers.map((player) => (
                  <div key={player.playerId} className="card p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-3">
                      {player.imageUrl ? (
                        <img
                          src={player.imageUrl}
                          alt={player.name}
                          className="h-16 w-16 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/api/placeholder/64/64';
                          }}
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200 text-2xl">
                          👤
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{player.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{player.team}</p>
                        <p className="text-xs text-gray-500">
                          {player.position && `${player.position}`}
                          {player.number && ` #${player.number}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => setEditingPlayer(player)}
                        className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                      >
                        ✏️ 編集
                      </button>
                      <button
                        onClick={() => setDeletingPlayer(player)}
                        className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                      >
                        🗑️ 削除
                      </button>
                    </div>
                  </div>
                  ))}
                </div>

                {/* ページネーション */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    {/* 前のページボタン */}
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      前へ
                    </button>

                    {/* ページ番号 */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            currentPage === page
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    {/* 次のページボタン */}
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      次へ
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="mt-8 animate-fade-in rounded-lg bg-red-50 p-6">
            <h3 className="mb-2 text-lg font-semibold text-red-900">❌ エラー</h3>
            <p className="text-sm text-red-700">{error}</p>
            <div className="mt-4 text-xs text-red-600">
              <p className="font-medium">考えられる原因：</p>
              <ul className="ml-4 mt-2 list-disc space-y-1">
                <li>Firestoreセキュリティルールで書き込みが許可されていない</li>
                <li>Firebase設定が正しくない</li>
                <li>インターネット接続の問題</li>
              </ul>
            </div>
          </div>
        )}

        {/* 成功結果表示 */}
        {result && (
          <div className="mt-8 animate-fade-in space-y-6">
            <div className="card p-6">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                {result.failed === 0 ? '✅ 完了' : '⚠️ 一部完了'}
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{result.success}</div>
                  <div className="text-sm text-green-700">成功</div>
                </div>
                <div className="rounded-lg bg-red-50 p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                  <div className="text-sm text-red-700">失敗</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="mt-4 rounded-lg bg-red-50 p-4">
                  <p className="mb-2 text-sm font-medium text-red-900">エラー詳細：</p>
                  <ul className="space-y-1 text-xs text-red-700">
                    {result.errors.map((err, index) => (
                      <li key={index}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {result.success > 0 && (
              <div className="card p-6">
                <h3 className="mb-4 text-xl font-semibold text-gray-900">🎯 次のステップ</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">1️⃣</span>
                    <div>
                      <p className="font-medium text-gray-900">セキュリティルールを戻す</p>
                      <p className="text-sm text-gray-600">
                        Firestoreの `players` コレクションの `allow write: if false;` に変更
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">2️⃣</span>
                    <div>
                      <p className="font-medium text-gray-900">トップページで確認</p>
                      <p className="text-sm text-gray-600">
                        選手一覧が表示されることを確認
                      </p>
                      <Link href="/" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline">
                        トップページを見る →
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">3️⃣</span>
                    <div>
                      <p className="font-medium text-gray-900">検索・フィルター機能を試す</p>
                      <p className="text-sm text-gray-600">
                        チームやポジションで絞り込み
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 戻るリンク */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← トップページに戻る
          </Link>
        </div>
      </div>

      {/* 編集モーダル */}
      {editingPlayer && (
        <EditPlayerModal
          player={editingPlayer}
          onClose={() => setEditingPlayer(null)}
          onSave={handleUpdatePlayer}
          loading={loading}
        />
      )}

      {addingPlayer && (
        <AddPlayerModal
          onClose={() => setAddingPlayer(false)}
          onSave={handleAddPlayer}
          loading={loading}
        />
      )}

      {/* 削除確認ダイアログ */}
      {deletingPlayer && (
        <DeleteConfirmDialog
          player={deletingPlayer}
          onClose={() => setDeletingPlayer(null)}
          onConfirm={() => handleDeletePlayer(deletingPlayer)}
          loading={loading}
        />
      )}

        {/* 試合結果取得モード */}
        {managementMode === 'games' && (
          <div className="card p-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">試合結果管理</h2>
            
            {/* メインモード切り替え */}
            <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => {
                  setGameViewMode('fetch');
                  setGameFetchResult(null);
                }}
                className={`flex-1 rounded-md px-4 py-3 text-base font-medium transition-colors ${
                  gameViewMode === 'fetch'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🏀 試合結果取得
              </button>
              <button
                onClick={() => {
                  setGameViewMode('manage');
                  fetchGames();
                }}
                className={`flex-1 rounded-md px-4 py-3 text-base font-medium transition-colors ${
                  gameViewMode === 'manage'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📝 試合結果管理
              </button>
            </div>

            {/* 試合結果取得モード */}
            {gameViewMode === 'fetch' && (
              <>
                <div className="mb-6 rounded-lg bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">
                    💡 ChatGPT APIを使って、最新のNBA試合結果を自動取得できます。
                    <br />
                    重複チェック機能により、既に登録されている試合はスキップされます。
                    <br />
                    ChatGPTは最新のウェブ情報にアクセスできるため、より正確な試合結果を取得できます。
                  </p>
                </div>

                {/* 結果表示 */}
                {gameFetchResult && (
                  <div className={`mb-6 rounded-lg p-4 ${
                    gameFetchResult.success 
                      ? 'bg-green-50 text-green-800' 
                      : 'bg-red-50 text-red-800'
                  }`}>
                    <p className="font-medium">{gameFetchResult.message}</p>
                    {gameFetchResult.success && gameFetchResult.gameId && (
                      <Link
                        href={`/games/${gameFetchResult.gameId}`}
                        className="mt-2 inline-block text-sm underline hover:no-underline"
                      >
                        試合詳細を見る →
                      </Link>
                    )}
                  </div>
                )}

                {/* 入力モード切り替え */}
                <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setGameInputMode('today')}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  gameInputMode === 'today'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📅 今日の試合
              </button>
              <button
                onClick={() => setGameInputMode('manual')}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  gameInputMode === 'manual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ✏️ 手動入力
              </button>
            </div>

            {/* 今日の試合結果を取得 */}
            {gameInputMode === 'today' && (
              <div className="space-y-4">
                <button
                  onClick={async () => {
                    setFetchingGame(true);
                    setGameFetchResult(null);
                    
                    try {
                      // 今日の日付を取得
                      const today = new Date();
                      const todayStr = today.toISOString().split('T')[0];
                      
                      // ChatGPT APIを呼び出して今日の試合結果を取得（チーム名は指定しない）
                      const response = await fetch('/api/games/fetch-from-chatgpt', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          date: todayStr,
                          // チーム名を指定しない = その日のすべての試合を取得
                        }),
                      });

                      const data = await response.json();
                      
                      if (response.ok && data.success) {
                        // 試合が見つかって登録された場合
                        setGameFetchResult({
                          success: true,
                          message: `試合結果を取得しました: ${data.gameData.homeTeam} vs ${data.gameData.awayTeam}`,
                          gameId: data.gameId,
                        });
                        // 試合結果一覧を更新
                        if (gameViewMode === 'manage') {
                          await fetchGames();
                        }
                      } else if (response.ok && data.gameNotFound) {
                        // 試合が見つからなかった場合（正常なケース）
                        setGameFetchResult({
                          success: false,
                          message: data.message || data.error || '試合が見つかりませんでした。試合日とチーム名を確認してください。',
                        });
                      } else {
                        // その他のエラー
                        if (data.duplicate) {
                          setGameFetchResult({
                            success: false,
                            message: 'この試合は既に登録されています。',
                          });
                        } else {
                          setGameFetchResult({
                            success: false,
                            message: data.error || data.message || '試合結果の取得に失敗しました',
                          });
                        }
                      }
                    } catch (error) {
                      setGameFetchResult({
                        success: false,
                        message: error instanceof Error ? error.message : 'エラーが発生しました',
                      });
                    } finally {
                      setFetchingGame(false);
                    }
                  }}
                  disabled={fetchingGame}
                  className="w-full rounded-md bg-blue-600 px-6 py-4 text-lg font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fetchingGame ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      取得中...
                    </span>
                  ) : (
                    '🏀 今日の試合結果を取得'
                  )}
                </button>
              </div>
            )}

            {/* 手動入力モード */}
            {gameInputMode === 'manual' && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  
                  if (!manualGameDate || !manualHomeTeam || !manualAwayTeam) {
                    setGameFetchResult({
                      success: false,
                      message: 'すべてのフィールドを入力してください',
                    });
                    return;
                  }

                  setFetchingGame(true);
                  setGameFetchResult(null);
                  
                  try {
                    const response = await fetch('/api/games/fetch-from-chatgpt', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        date: manualGameDate,
                        homeTeam: manualHomeTeam,
                        awayTeam: manualAwayTeam,
                      }),
                    });

                    const data = await response.json();
                    
                    if (response.ok && data.success) {
                      // 試合が見つかって登録された場合
                      setGameFetchResult({
                        success: true,
                        message: `試合結果を取得しました: ${data.gameData.homeTeam} vs ${data.gameData.awayTeam}`,
                        gameId: data.gameId,
                      });
                      // フォームをリセット
                      setManualGameDate('');
                      setManualHomeTeam('');
                      setManualAwayTeam('');
                      // 試合結果一覧を更新
                      if (gameViewMode === 'manage') {
                        await fetchGames();
                      }
                    } else if (response.ok && data.gameNotFound) {
                      // 試合が見つからなかった場合（正常なケース）
                      setGameFetchResult({
                        success: false,
                        message: data.message || data.error || '試合が見つかりませんでした。試合日とチーム名を確認してください。',
                      });
                    } else {
                      // その他のエラー
                      if (data.duplicate) {
                        setGameFetchResult({
                          success: false,
                          message: 'この試合は既に登録されています。',
                        });
                      } else {
                        setGameFetchResult({
                          success: false,
                          message: data.error || data.message || '試合結果の取得に失敗しました',
                        });
                      }
                    }
                  } catch (error) {
                    setGameFetchResult({
                      success: false,
                      message: error instanceof Error ? error.message : 'エラーが発生しました',
                    });
                  } finally {
                    setFetchingGame(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="gameDate" className="mb-2 block text-sm font-medium text-gray-700">
                    試合日 <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="gameDate"
                    type="date"
                    value={manualGameDate}
                    onChange={(e) => setManualGameDate(e.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="awayTeam" className="mb-2 block text-sm font-medium text-gray-700">
                    アウェイチーム <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="awayTeam"
                    type="text"
                    value={manualAwayTeam}
                    onChange={(e) => setManualAwayTeam(e.target.value)}
                    placeholder="例: ゴールデンステート・ウォリアーズ"
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="homeTeam" className="mb-2 block text-sm font-medium text-gray-700">
                    ホームチーム <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="homeTeam"
                    type="text"
                    value={manualHomeTeam}
                    onChange={(e) => setManualHomeTeam(e.target.value)}
                    placeholder="例: ロサンゼルス・レイカーズ"
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={fetchingGame}
                  className="w-full rounded-md bg-blue-600 px-6 py-4 text-lg font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fetchingGame ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      取得中...
                    </span>
                  ) : (
                    '🏀 試合結果を取得'
                  )}
                </button>
              </form>
            )}

            {/* 注意事項 */}
            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 text-sm font-bold text-gray-900">注意事項</h3>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• OpenAI APIキーが設定されている必要があります</li>
                <li>• 既に登録されている試合は自動的にスキップされます</li>
                <li>• 無料枠は月60リクエスト/分まで利用可能です</li>
                <li>• 現在は1試合ずつ取得する必要があります</li>
                <li>• ChatGPTは最新のウェブ情報にアクセスできるため、より正確な結果が得られます</li>
              </ul>
            </div>
              </>
            )}

            {/* 試合結果管理モード */}
            {gameViewMode === 'manage' && (
              <div className="space-y-6">
                {/* ヘッダーと更新ボタン */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">登録済み試合一覧</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      全 {games.length} 試合
                    </p>
                  </div>
                  <button
                    onClick={fetchGames}
                    disabled={loadingGames}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loadingGames ? '更新中...' : '🔄 更新'}
                  </button>
                </div>

                {/* 試合一覧 */}
                {loadingGames ? (
                  <div className="flex justify-center py-12">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                  </div>
                ) : games.length > 0 ? (
                  <div className="space-y-4">
                    {games.map((game) => (
                      <div key={game.gameId} className="card p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="mb-2 text-sm text-gray-500">
                              {new Date(game.date).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                weekday: 'short',
                              })}
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="text-sm font-medium text-gray-700">{game.awayTeam}</div>
                                <div className="text-2xl font-bold text-gray-900">{game.awayScore}</div>
                              </div>
                              <div className="text-gray-400">VS</div>
                              <div className="text-center">
                                <div className="text-sm font-medium text-gray-700">{game.homeTeam}</div>
                                <div className="text-2xl font-bold text-gray-900">{game.homeScore}</div>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              選手数: {game.players?.length || 0}名
                            </div>
                          </div>
                          <div className="ml-4 flex gap-2">
                            <button
                              onClick={() => setEditingGame(game)}
                              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => setDeletingGame(game)}
                              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                    <p className="text-gray-600">まだ試合結果が登録されていません</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      {/* 試合結果編集モーダル */}
      {editingGame && (
        <EditGameModal
          game={editingGame}
          onClose={() => setEditingGame(null)}
          onSave={handleUpdateGame}
          loading={loading}
        />
      )}

      {/* 試合結果削除確認ダイアログ */}
      {deletingGame && (
        <DeleteGameConfirmDialog
          game={deletingGame}
          onClose={() => setDeletingGame(null)}
          onConfirm={handleDeleteGame}
          loading={loading}
        />
      )}
    </div>
  );
}

// 編集モーダルコンポーネント
function EditPlayerModal({
  player,
  onClose,
  onSave,
  loading,
}: {
  player: Player;
  onClose: () => void;
  onSave: (player: Player) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState<Player>(player);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">選手情報を編集</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                選手ID <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.playerId}
                disabled
                className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">IDは変更できません</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                選手名 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                チーム名 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ポジション</label>
              <input
                type="text"
                value={formData.position || ''}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">背番号</label>
              <input
                type="number"
                value={formData.number || ''}
                onChange={(e) => setFormData({ ...formData, number: e.target.value ? Number(e.target.value) : undefined })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">身長</label>
              <input
                type="text"
                value={formData.height || ''}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                placeholder="例: 198cm"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">体重</label>
              <input
                type="text"
                value={formData.weight || ''}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="例: 93kg"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">生年月日</label>
              <input
                type="text"
                value={formData.birthDate || ''}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                placeholder="例: 1988年3月14日"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">国籍</label>
              <input
                type="text"
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="例: アメリカ"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">画像URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.png"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">グッズ購入URL (shopUrl)</label>
              <input
                type="url"
                value={formData.shopUrl || ''}
                onChange={(e) => setFormData({ ...formData, shopUrl: e.target.value })}
                placeholder="https://example.com/shop"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">選手詳細ページに「選手のグッズを見る」ボタンとして表示されます</p>
            </div>

            {/* ドラフト情報 */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">ドラフト年</label>
                <input
                  type="number"
                  value={formData.draftYear || ''}
                  onChange={(e) => setFormData({ ...formData, draftYear: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="例: 2019"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ドラフトラウンド</label>
                <input
                  type="number"
                  value={formData.draftRound || ''}
                  onChange={(e) => setFormData({ ...formData, draftRound: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="例: 1"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ドラフト順位</label>
                <input
                  type="number"
                  value={formData.draftPick || ''}
                  onChange={(e) => setFormData({ ...formData, draftPick: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="例: 9"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* スタッツ情報 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">スタッツ情報</label>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600">得点 (PTS)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.stats?.pts || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      stats: { 
                        pts: e.target.value ? Number(e.target.value) : 0,
                        ast: formData.stats?.ast || 0,
                        reb: formData.stats?.reb || 0,
                        fg: formData.stats?.fg || 0,
                        season: formData.stats?.season || '2024-25'
                      } 
                    })}
                    placeholder="例: 23.3"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">リバウンド (REB)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.stats?.reb || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      stats: { 
                        pts: formData.stats?.pts || 0,
                        ast: formData.stats?.ast || 0,
                        reb: e.target.value ? Number(e.target.value) : 0,
                        fg: formData.stats?.fg || 0,
                        season: formData.stats?.season || '2024-25'
                      } 
                    })}
                    placeholder="例: 4.3"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">アシスト (AST)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.stats?.ast || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      stats: { 
                        pts: formData.stats?.pts || 0,
                        ast: e.target.value ? Number(e.target.value) : 0,
                        reb: formData.stats?.reb || 0,
                        fg: formData.stats?.fg || 0,
                        season: formData.stats?.season || '2024-25'
                      } 
                    })}
                    placeholder="例: 4.2"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">FG%</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.stats?.fg || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      stats: { 
                        pts: formData.stats?.pts || 0,
                        ast: formData.stats?.ast || 0,
                        reb: formData.stats?.reb || 0,
                        fg: e.target.value ? Number(e.target.value) : 0,
                        season: formData.stats?.season || '2024-25'
                      } 
                    })}
                    placeholder="例: 51.1"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600">シーズン</label>
                  <input
                    type="text"
                    value={formData.stats?.season || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      stats: { 
                        pts: formData.stats?.pts || 0,
                        ast: formData.stats?.ast || 0,
                        reb: formData.stats?.reb || 0,
                        fg: formData.stats?.fg || 0,
                        season: e.target.value
                      } 
                    })}
                    placeholder="例: 2024-25"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 契約情報 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">契約金額（年俸・ドル）</label>
                <input
                  type="number"
                  value={formData.contractAmount || ''}
                  onChange={(e) => setFormData({ ...formData, contractAmount: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="例: 17000000"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">例: 17,000,000（1700万ドル）</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">契約年数</label>
                <input
                  type="number"
                  value={formData.contractYears || ''}
                  onChange={(e) => setFormData({ ...formData, contractYears: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="例: 4"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">例: 4年契約</p>
              </div>
            </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '保存中...' : '💾 保存'}
          </button>
        </div>
      </form>
    </div>
  </div>
  )}

// 削除確認ダイアログコンポーネント
function DeleteConfirmDialog({
  player,
  onClose,
  onConfirm,
  loading,
}: {
  player: Player;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-gray-900">選手を削除</h2>
        
        <div className="mb-6">
          <p className="text-gray-700">
            以下の選手を本当に削除しますか？
          </p>
          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <p className="font-bold text-gray-900">{player.name}</p>
            <p className="text-sm text-gray-600">{player.team}</p>
            {player.position && (
              <p className="text-xs text-gray-500">
                {player.position}
                {player.number && ` #${player.number}`}
              </p>
            )}
          </div>
          <p className="mt-4 text-sm text-red-600 font-medium">
            ⚠️ この操作は取り消せません。選手に関連するレビューは残りますが、選手情報は表示されなくなります。
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? '削除中...' : '🗑️ 削除する'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 試合結果編集モーダルコンポーネント
function EditGameModal({
  game,
  onClose,
  onSave,
  loading,
}: {
  game: any;
  onClose: () => void;
  onSave: (gameData: any) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    date: game.date || '',
    homeTeam: game.homeTeam || '',
    awayTeam: game.awayTeam || '',
    homeScore: game.homeScore || 0,
    awayScore: game.awayScore || 0,
    status: game.status || 'finished',
    players: game.players || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">試合結果を編集</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本情報 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                試合日 <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ステータス
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="finished">終了</option>
                <option value="scheduled">予定</option>
                <option value="live">試合中</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                アウェイチーム <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.awayTeam}
                onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                アウェイスコア
              </label>
              <input
                type="number"
                value={formData.awayScore}
                onChange={(e) => setFormData({ ...formData, awayScore: Number(e.target.value) })}
                min="0"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ホームチーム <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.homeTeam}
                onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ホームスコア
              </label>
              <input
                type="number"
                value={formData.homeScore}
                onChange={(e) => setFormData({ ...formData, homeScore: Number(e.target.value) })}
                min="0"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 選手情報 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              選手数: {formData.players.length}名
            </label>
            <p className="text-xs text-gray-500">
              選手情報の編集は、試合詳細ページから行ってください。
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '保存中...' : '💾 保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 試合結果削除確認ダイアログコンポーネント
function DeleteGameConfirmDialog({
  game,
  onClose,
  onConfirm,
  loading,
}: {
  game: any;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-gray-900">試合結果を削除</h2>
        
        <div className="mb-6">
          <p className="text-gray-700">
            以下の試合結果を本当に削除しますか？
          </p>
          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <div className="mb-2 text-sm text-gray-500">
              {new Date(game.date).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">{game.awayTeam}</span>
              <span className="text-gray-500">vs</span>
              <span className="font-bold text-gray-900">{game.homeTeam}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              スコア: {game.awayScore} - {game.homeScore}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              選手数: {game.players?.length || 0}名
            </div>
          </div>
          <p className="mt-4 text-sm text-red-600 font-medium">
            ⚠️ この操作は取り消せません。試合結果と関連するすべてのレビューが削除されます。
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? '削除中...' : '🗑️ 削除する'}
          </button>
        </div>
      </div>
    </div>
  );
}

