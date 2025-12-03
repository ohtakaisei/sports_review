import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

/**
 * Firebase Admin SDK の初期化
 * 
 * このファイルはサーバー側（API Routes）でのみ使用されます。
 * Admin SDKはFirestoreのセキュリティルールをバイパスし、
 * 完全な読み書き権限を持ちます。
 * 
 * 環境変数からサービスアカウントの認証情報を読み込みます。
 */

let adminApp: App;
let adminDb: Firestore;

/**
 * Admin SDKのアプリインスタンスを取得
 * シングルトンパターンで、既に初期化されている場合は既存のインスタンスを返す
 */
function getAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  // 既に初期化されているアプリがあれば、それを使用
  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
    return adminApp;
  }

  // 環境変数から認証情報を取得
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  // 環境変数のチェック
  if (!projectId || !clientEmail || !privateKey) {
    console.error('Firebase Admin SDK環境変数の確認:');
    console.error('- NEXT_PUBLIC_FIREBASE_PROJECT_ID:', projectId ? 'Set' : 'Missing');
    console.error('- FIREBASE_CLIENT_EMAIL:', clientEmail ? 'Set' : 'Missing');
    console.error('- FIREBASE_PRIVATE_KEY:', privateKey ? 'Set' : 'Missing');
    throw new Error(
      'Firebase Admin SDK の初期化に必要な環境変数が設定されていません。\n' +
      '必要な環境変数: NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY\n' +
      'Vercelで環境変数を設定した後、必ず再デプロイしてください。'
    );
  }

  // Admin SDKを初期化
  try {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    console.error('Project ID:', projectId);
    console.error('Client Email:', clientEmail ? 'Set' : 'Not Set');
    console.error('Private Key:', privateKey ? `Set (${privateKey.length} chars)` : 'Not Set');
    
    // より詳細なエラーメッセージ
    if (error instanceof Error) {
      if (error.message.includes('PEM')) {
        throw new Error(
          'Firebase Admin SDK初期化エラー: プライベートキーの形式が正しくありません。' +
          'Vercelの環境変数でFIREBASE_PRIVATE_KEYの値が正しい形式（ダブルクォートなし、\\nを含む）か確認してください。'
        );
      }
      if (error.message.includes('credential')) {
        throw new Error(
          'Firebase Admin SDK初期化エラー: 認証情報が無効です。' +
          'FIREBASE_CLIENT_EMAILとFIREBASE_PRIVATE_KEYが正しいか確認してください。'
        );
      }
    }
    throw error;
  }

  return adminApp;
}

/**
 * Admin SDKのFirestoreインスタンスを取得
 * API Routesでのみ使用してください
 */
export function getAdminFirestore(): Firestore {
  if (adminDb) {
    return adminDb;
  }

  const app = getAdminApp();
  adminDb = getFirestore(app);
  
  return adminDb;
}





