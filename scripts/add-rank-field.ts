/**
 * 既存の選手データにrankフィールドを追加するスクリプト
 * 
 * 使用方法:
 *   npx tsx scripts/add-rank-field.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// 環境変数を読み込み
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Firebase Admin SDKを初期化
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getFirestore();
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Firebase Admin SDK環境変数が設定されていません');
    console.error('必要な環境変数: NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
    process.exit(1);
  }

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return getFirestore();
}

async function addRankFieldToAllPlayers() {
  console.log('🚀 既存の選手データにrankフィールドを追加開始...\n');

  const db = initializeFirebaseAdmin();
  const playersRef = db.collection('players');
  const snapshot = await playersRef.get();

  if (snapshot.empty) {
    console.log('⚠️ 選手データが見つかりません');
    return;
  }

  console.log(`📋 ${snapshot.size}人の選手データを処理します\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const playerName = data.name || doc.id;

    try {
      // すでにrankフィールドがある場合はスキップ
      if (data.rank) {
        console.log(`⏭️  ${playerName}: 既にrankフィールドがあります (${data.rank})`);
        skipped++;
        continue;
      }

      // rankフィールドを追加（初期値: F）
      await playersRef.doc(doc.id).update({
        rank: 'F',
      });

      console.log(`✅ ${playerName}: rank = "F" を追加しました`);
      updated++;
    } catch (error) {
      console.error(`❌ ${playerName}: 更新失敗 - ${error}`);
      failed++;
    }
  }

  console.log('\n========================================');
  console.log('📊 処理結果');
  console.log('========================================');
  console.log(`✅ 更新成功: ${updated}人`);
  console.log(`⏭️  スキップ: ${skipped}人`);
  console.log(`❌ 失敗: ${failed}人`);
  console.log('========================================\n');

  if (updated > 0) {
    console.log('🎉 完了！すべての選手にrank = "F"が追加されました');
  }
}

// スクリプト実行
addRankFieldToAllPlayers()
  .then(() => {
    console.log('\n✨ スクリプト完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ エラー:', error);
    process.exit(1);
  });

