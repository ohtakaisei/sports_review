
import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import playersData from '@/scripts/popular-players.json';

export async function GET() {
  try {
    const db = getAdminFirestore();
    const batch = db.batch();
    let count = 0;

    for (const player of playersData) {
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
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully imported ${count} players.`,
      count 
    });
  } catch (error) {
    console.error('Error importing players:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import players' },
      { status: 500 }
    );
  }
}


