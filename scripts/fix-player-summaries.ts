/**
 * 選手の集計データを修正するスクリプト
 * 
 * 使用方法:
 * 1. このスクリプトを実行して全選手の集計データを再計算
 * 2. または特定の選手IDを指定して再計算
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Firebase Admin SDKを初期化
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

/**
 * 特定の選手の集計データを再計算
 */
async function recalculatePlayerSummary(playerId: string): Promise<void> {
  console.log(`選手 ${playerId} の集計データを再計算中...`);
  
  await db.runTransaction(async (transaction) => {
    const playerRef = db.collection('players').doc(playerId);
    const playerSnap = await transaction.get(playerRef);
    
    if (!playerSnap.exists) {
      throw new Error(`選手 ${playerId} が見つかりません`);
    }
    
    // その選手の全レビューを取得
    const reviewsQuery = db.collection('reviews')
      .where('playerId', '==', playerId)
      .where('status', '==', 'published');
    
    const reviewsSnapshot = await reviewsQuery.get();
    const reviews = reviewsSnapshot.docs.map(doc => doc.data());
    
    console.log(`  - レビュー数: ${reviews.length}件`);
    
    if (reviews.length === 0) {
      // レビューがない場合、集計データをクリア
      transaction.update(playerRef, {
        reviewCount: 0,
        summary: {},
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`  - 集計データをクリアしました`);
      return;
    }
    
    // 各項目の平均スコアを計算
    const summary: Record<string, number> = {};
    const allItemIds = new Set<string>();
    
    // 全レビューの全項目IDを収集
    reviews.forEach(review => {
      Object.keys(review.scores || {}).forEach(itemId => {
        allItemIds.add(itemId);
      });
    });
    
    // 各項目の平均を計算
    allItemIds.forEach(itemId => {
      const scores = reviews
        .map(review => review.scores?.[itemId])
        .filter(score => score !== undefined) as number[];
      
      if (scores.length > 0) {
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        summary[itemId] = Math.round(average * 100) / 100; // 小数点2桁まで
      }
    });
    
    transaction.update(playerRef, {
      reviewCount: reviews.length,
      summary: summary,
      updatedAt: FieldValue.serverTimestamp(),
    });
    
    console.log(`  - 集計データを更新しました (${Object.keys(summary).length}項目)`);
  });
}

/**
 * 全選手の集計データを再計算
 */
async function recalculateAllPlayers(): Promise<void> {
  console.log('全選手の集計データを再計算中...');
  
  const playersSnapshot = await db.collection('players').get();
  const players = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  console.log(`${players.length}名の選手が見つかりました`);
  
  for (const player of players) {
    try {
      await recalculatePlayerSummary(player.id);
    } catch (error) {
      console.error(`選手 ${player.id} の処理中にエラー:`, error);
    }
  }
  
  console.log('全選手の集計データ再計算が完了しました');
}

// メイン処理
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // 引数がない場合は全選手を再計算
    await recalculateAllPlayers();
  } else {
    // 特定の選手IDを指定
    const playerId = args[0];
    await recalculatePlayerSummary(playerId);
  }
}

// スクリプト実行
main()
  .then(() => {
    console.log('スクリプトが正常に完了しました');
    process.exit(0);
  })
  .catch((error) => {
    console.error('スクリプト実行エラー:', error);
    process.exit(1);
  });

