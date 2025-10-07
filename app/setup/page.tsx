'use client';

import { useState, useRef } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

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
    summary: {}
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
    summary: {}
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
    summary: {}
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
    summary: {}
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
    summary: {}
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
    summary: {}
  }
];

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'sample' | 'json'>('sample');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addPlayers = async (players: any[]) => {
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
            summary: player.summary || {}
          };

          const playerRef = doc(db, 'players', player.playerId);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">開発用セットアップ</h1>
          <p className="text-gray-600">サンプル選手データを簡単に追加</p>
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
              ⚠️ データ追加後は、必ず `allow write: if false;` に戻してください！
            </p>
          </div>
        </div>

        {/* インポート方法選択 */}
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
                      <a href="/" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline">
                        トップページを見る →
                      </a>
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
          <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← トップページに戻る
          </a>
        </div>
      </div>
    </div>
  );
}

