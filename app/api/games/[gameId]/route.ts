import { NextRequest, NextResponse } from 'next/server';
import { getGame } from '@/lib/firebase/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Game } from '@/lib/types';

/**
 * 試合結果を取得するAPI
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = params;
    const game = await getGame(gameId);

    if (!game) {
      return NextResponse.json(
        { error: '試合が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      game,
    });
  } catch (error) {
    console.error('試合結果の取得に失敗:', error);
    return NextResponse.json(
      {
        error: '試合結果の取得に失敗しました',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * 試合結果を更新するAPI（Admin SDK使用）
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = params;
    const body = await request.json();

    // バリデーション
    if (!body.date || !body.homeTeam || !body.awayTeam) {
      return NextResponse.json(
        { error: '日付、ホームチーム、アウェイチームは必須です' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const gameRef = db.collection('games').doc(gameId);

    // 試合が存在するか確認
    const gameSnap = await gameRef.get();
    if (!gameSnap.exists) {
      return NextResponse.json(
        { error: '試合が見つかりません' },
        { status: 404 }
      );
    }

    // 試合データを更新
    await gameRef.update({
      date: body.date,
      homeTeam: body.homeTeam,
      awayTeam: body.awayTeam,
      homeScore: body.homeScore || 0,
      awayScore: body.awayScore || 0,
      status: body.status || 'finished',
      players: body.players || [],
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: '試合結果を更新しました',
    });
  } catch (error) {
    console.error('試合結果の更新に失敗:', error);
    return NextResponse.json(
      {
        error: '試合結果の更新に失敗しました',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * 試合結果を削除するAPI（Admin SDK使用）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = params;

    const db = getAdminFirestore();
    const gameRef = db.collection('games').doc(gameId);

    // 試合が存在するか確認
    const gameSnap = await gameRef.get();
    if (!gameSnap.exists) {
      return NextResponse.json(
        { error: '試合が見つかりません' },
        { status: 404 }
      );
    }

    // 関連する試合レビューも削除
    const reviewsQuery = db.collection('gameReviews').where('gameId', '==', gameId);
    const reviewsSnapshot = await reviewsQuery.get();
    
    const batch = db.batch();
    reviewsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    batch.delete(gameRef);
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: '試合結果と関連レビューを削除しました',
    });
  } catch (error) {
    console.error('試合結果の削除に失敗:', error);
    return NextResponse.json(
      {
        error: '試合結果の削除に失敗しました',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}



