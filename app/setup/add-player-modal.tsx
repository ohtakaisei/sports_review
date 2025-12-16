'use client';

import { useState } from 'react';
import { Player } from '@/lib/types';

// 新規追加モーダルコンポーネント
export default function AddPlayerModal({
  onClose,
  onSave,
  loading,
}: {
  onClose: () => void;
  onSave: (player: Omit<Player, 'playerId'> & { playerId: string }) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState<Omit<Player, 'playerId' | 'reviewCount' | 'summary' | 'rank'> & { playerId: string }>({
    playerId: '',
    name: '',
    team: '',
    sport: 'nba',
    position: '',
    number: null,
    height: '',
    weight: '',
    birthDate: '',
    country: '',
    imageUrl: '',
    draftYear: null,
    draftRound: null,
    draftPick: null,
    stats: null,
    contractAmount: null,
    contractYears: null,
    shopUrl: null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">選手を新規追加</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                選手ID <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.playerId}
                onChange={(e) => setFormData({ ...formData, playerId: e.target.value })}
                required
                placeholder="例: lebron-james"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">英数字とハイフンのみ使用（小文字推奨）</p>
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
                placeholder="例: レブロン・ジェームズ"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                チーム <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                required
                placeholder="例: ロサンゼルス・レイカーズ"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ポジション</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="例: SF, PG, C"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">背番号</label>
              <input
                type="number"
                value={formData.number || ''}
                onChange={(e) => setFormData({ ...formData, number: e.target.value ? Number(e.target.value) : null })}
                placeholder="例: 23"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">身長</label>
              <input
                type="text"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                placeholder="例: 206cm"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">体重</label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="例: 113kg"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">生年月日</label>
              <input
                type="text"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                placeholder="例: 1984年12月30日"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">国籍</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="例: アメリカ"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">画像URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="例: https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* ドラフト情報 */}
          <div className="border-t pt-4">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">ドラフト情報（任意）</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">ドラフト年</label>
                <input
                  type="number"
                  value={formData.draftYear || ''}
                  onChange={(e) => setFormData({ ...formData, draftYear: e.target.value ? Number(e.target.value) : null })}
                  placeholder="例: 2003"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ラウンド</label>
                <input
                  type="number"
                  value={formData.draftRound || ''}
                  onChange={(e) => setFormData({ ...formData, draftRound: e.target.value ? Number(e.target.value) : null })}
                  placeholder="例: 1"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">順位</label>
                <input
                  type="number"
                  value={formData.draftPick || ''}
                  onChange={(e) => setFormData({ ...formData, draftPick: e.target.value ? Number(e.target.value) : null })}
                  placeholder="例: 1"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* スタッツ情報 */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">スタッツ情報（任意）</label>
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
                  placeholder="例: 8.3"
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
                  placeholder="例: 7.3"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">FG成功率 (%)</label>
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
                  placeholder="例: 52.4"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 契約情報 */}
          <div className="border-t pt-4">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">契約情報（任意）</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">契約金額（年俸、ドル）</label>
                <input
                  type="number"
                  value={formData.contractAmount || ''}
                  onChange={(e) => setFormData({ ...formData, contractAmount: e.target.value ? Number(e.target.value) : null })}
                  placeholder="例: 47607350"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">契約年数</label>
                <input
                  type="number"
                  value={formData.contractYears || ''}
                  onChange={(e) => setFormData({ ...formData, contractYears: e.target.value ? Number(e.target.value) : null })}
                  placeholder="例: 2"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '追加中...' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



