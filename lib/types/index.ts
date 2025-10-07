// 評価スコア (S=6, A=5, B=4, C=3, D=2, F=1)
export type ScoreGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export const SCORE_MAP: Record<ScoreGrade, number> = {
  S: 6,
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  F: 1,
};

// 評価項目のカテゴリー
export type EvaluationCategory = 'offense' | 'defense' | 'physical_other';

// 評価項目
export interface EvaluationItem {
  itemId: string;
  name: string;
  category: EvaluationCategory;
  displayOrder: number;
}

// 選手情報
export interface Player {
  playerId: string;
  name: string;
  team: string;
  sport: 'nba';
  imageUrl: string;
  reviewCount: number;
  summary: Record<string, number>; // itemId: 平均スコア
  position?: string;
  number?: number;
  height?: string;
  weight?: string;
  birthDate?: string;
  country?: string;
}

// レビュー
export interface Review {
  reviewId: string;
  playerId: string;
  comment: string;
  createdAt: string;
  status: 'published' | 'pending' | 'rejected';
  overallScore: number;
  scores: Record<string, number>; // itemId: スコア
}

// レビュー投稿フォーム用の型
export interface ReviewFormData {
  comment: string;
  scores: Record<string, ScoreGrade>;
}

// NBA評価項目定義
export const NBA_EVALUATION_ITEMS: EvaluationItem[] = [
  // オフェンス
  { itemId: 'nba_inside_shoot', name: 'インサイドシュート', category: 'offense', displayOrder: 1 },
  { itemId: 'nba_middle_shoot', name: 'ミドルシュート', category: 'offense', displayOrder: 2 },
  { itemId: 'nba_3pt_shoot', name: '3ポイントシュート', category: 'offense', displayOrder: 3 },
  { itemId: 'nba_dribble', name: 'ドリブル', category: 'offense', displayOrder: 4 },
  { itemId: 'nba_pass', name: 'パス', category: 'offense', displayOrder: 5 },
  { itemId: 'nba_offball_move', name: 'オフボールの動き', category: 'offense', displayOrder: 6 },
  
  // ディフェンス
  { itemId: 'nba_onball_defense', name: 'オンボールDF', category: 'defense', displayOrder: 7 },
  { itemId: 'nba_offball_defense', name: 'オフボールDF', category: 'defense', displayOrder: 8 },
  { itemId: 'nba_1on1_defense', name: '1on1 DF', category: 'defense', displayOrder: 9 },
  { itemId: 'nba_help_defense', name: 'ヘルプDF', category: 'defense', displayOrder: 10 },
  
  // フィジカル/その他
  { itemId: 'nba_rebound', name: 'リバウンド', category: 'physical_other', displayOrder: 11 },
  { itemId: 'nba_block', name: 'ブロック', category: 'physical_other', displayOrder: 12 },
  { itemId: 'nba_speed', name: 'スピード', category: 'physical_other', displayOrder: 13 },
  { itemId: 'nba_stamina', name: 'スタミナ', category: 'physical_other', displayOrder: 14 },
  { itemId: 'nba_basketball_iq', name: 'バスケIQ', category: 'physical_other', displayOrder: 15 },
  { itemId: 'nba_leadership', name: 'リーダーシップ', category: 'physical_other', displayOrder: 16 },
];

export const CATEGORY_LABELS: Record<EvaluationCategory, string> = {
  offense: 'オフェンス',
  defense: 'ディフェンス',
  physical_other: 'フィジカル/その他',
};

