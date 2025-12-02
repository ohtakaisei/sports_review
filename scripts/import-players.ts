
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
console.log(`Loading environment variables from: ${envPath}`);

const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('Error loading .env.local:', result.error);
} else {
  console.log('.env.local loaded successfully');
}

// Initialize Firebase Admin
if (!getApps().length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  console.log('Checking environment variables:');
  console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', projectId ? 'Set' : 'Not Set');
  console.log('FIREBASE_CLIENT_EMAIL:', clientEmail ? 'Set' : 'Not Set');
  console.log('FIREBASE_PRIVATE_KEY:', privateKey ? 'Set' : 'Not Set');

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing required environment variables.');
    process.exit(1);
  }

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const db = getFirestore();

async function importPlayers() {
  try {
    const playersFilePath = path.join(process.cwd(), 'scripts', 'popular-players.json');
    console.log(`Reading players data from: ${playersFilePath}`);
    
    const playersData = JSON.parse(fs.readFileSync(playersFilePath, 'utf8'));

    console.log(`Found ${playersData.length} players to import.`);

    const batch = db.batch();
    let count = 0;

    for (const player of playersData) {
      // playerIdをドキュメントIDとして使用（数値の場合は文字列に変換）
      const docId = String(player.playerId);
      const playerRef = db.collection('players').doc(docId);

      // 既存データを確認
      const docSnap = await playerRef.get();
      
      const playerData = {
        ...player,
        reviewCount: docSnap.exists ? docSnap.data()?.reviewCount || 0 : 0,
        summary: docSnap.exists ? docSnap.data()?.summary || {} : {},
        updatedAt: new Date().toISOString(),
      };

      batch.set(playerRef, playerData, { merge: true });
      count++;
    }

    await batch.commit();
    console.log(`Successfully imported ${count} players.`);
  } catch (error) {
    console.error('Error importing players:', error);
  }
}

importPlayers();
