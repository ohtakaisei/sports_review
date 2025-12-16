/**
 * 手動で試合結果を登録するスクリプト
 * 
 * 使用方法:
 * 1. このファイルの gameData に試合結果を入力（日付、チーム名、スコアのみ）
 * 2. tsx scripts/add-game.ts を実行
 * 
 * 注意: 選手データは不要です。実際のページでチームの全ロスターが表示され、
 *       ユーザーが各選手に対してその試合の評価を投稿できます。
 */

// 環境変数を読み込む
import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { createGameAdmin, checkGameExistsAdmin } from '../lib/firebase/admin-firestore';
import { Game } from '../lib/types';

// ============================================
// ここに試合結果を入力してください
// ============================================
const gameData: Omit<Game, 'gameId' | 'createdAt'> = {
  date: '2025-12-07', // YYYY-MM-DD形式
  homeTeam: 'フィラデルフィア・セブンティシクサーズ', // ホームチーム名（日本語の正式名称）
  awayTeam: 'ロサンゼルス・レイカーズ', // アウェイチーム名（日本語の正式名称）
  homeScore: 108, // ホームチームのスコア
  awayScore: 112, // アウェイチームのスコア
  status: 'finished', // 'finished' | 'scheduled' | 'live'
  // players フィールドは不要（チームのロスターは自動取得されます）
};

// ============================================
// 実行部分（以下は編集不要）
// ============================================

async function addGame() {
  try {
    console.log('========================================');
    console.log('試合結果を登録します...');
    console.log('========================================');
    console.log('日付:', gameData.date);
    console.log('試合:', `${gameData.awayTeam} vs ${gameData.homeTeam}`);
    console.log('スコア:', `${gameData.awayScore} - ${gameData.homeScore}`);
    console.log('========================================');

    // 重複チェック
    const exists = await checkGameExistsAdmin(gameData.date, gameData.homeTeam, gameData.awayTeam);
    if (exists) {
      console.error('❌ この試合は既に登録されています');
      process.exit(1);
    }

    // データ検証
    if (gameData.homeScore === 0 && gameData.awayScore === 0) {
      console.error('❌ スコアが0-0です。正しいスコアを入力してください。');
      process.exit(1);
    }

    // Firestoreに保存
    const gameId = await createGameAdmin(gameData);

    console.log('========================================');
    console.log('✅ 試合結果を登録しました！');
    console.log('========================================');
    console.log('Game ID:', gameId);
    console.log('日付:', gameData.date);
    console.log('試合:', `${gameData.awayTeam} vs ${gameData.homeTeam}`);
    console.log('スコア:', `${gameData.awayScore} - ${gameData.homeScore}`);
    console.log('========================================');
  } catch (error) {
    console.error('❌ 試合結果の登録に失敗:', error);
    process.exit(1);
  }
}

addGame();

