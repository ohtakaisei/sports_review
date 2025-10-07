import { type ClassValue, clsx } from 'clsx';
import { ScoreGrade, SCORE_MAP } from '@/lib/types';

// Tailwind CSSのクラス名を結合するユーティリティ
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// スコアグレードを数値に変換
export function gradeToNumber(grade: ScoreGrade): number {
  return SCORE_MAP[grade];
}

// 数値をスコアグレードに変換（最も近いグレードを返す）
export function numberToGrade(score: number): ScoreGrade {
  const rounded = Math.round(score);
  if (rounded >= 6) return 'S';
  if (rounded >= 5) return 'A';
  if (rounded >= 4) return 'B';
  if (rounded >= 3) return 'C';
  if (rounded >= 2) return 'D';
  return 'F';
}

// 平均スコアを計算
export function calculateAverageScore(scores: Record<string, number>): number {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

// 日付フォーマット
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

// 相対時間フォーマット
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'たった今';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}時間前`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}日前`;
  
  return formatDate(dateString);
}

// グレードに応じた色を返す
export function getGradeColor(grade: ScoreGrade): string {
  const colorMap: Record<ScoreGrade, string> = {
    S: 'text-purple-600 bg-purple-50 border-purple-300',
    A: 'text-blue-600 bg-blue-50 border-blue-300',
    B: 'text-green-600 bg-green-50 border-green-300',
    C: 'text-yellow-600 bg-yellow-50 border-yellow-300',
    D: 'text-orange-600 bg-orange-50 border-orange-300',
    F: 'text-red-600 bg-red-50 border-red-300',
  };
  return colorMap[grade];
}

