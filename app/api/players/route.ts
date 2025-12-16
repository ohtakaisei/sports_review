import { NextRequest, NextResponse } from 'next/server';
import { createPlayerAdmin, updatePlayerAdmin, deletePlayerAdmin } from '@/lib/firebase/admin-firestore';
import { Player } from '@/lib/types';

/**
 * 選手を新規作成するAPI（Admin SDK使用）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    if (!body.playerId || !body.name || !body.team) {
      return NextResponse.json(
        { error: '必須フィールド（playerId, name, team）が不足しています' },
        { status: 400 }
      );
    }

    // デフォルト値を設定
    const playerData: Player = {
      playerId: body.playerId,
      name: body.name,
      team: body.team,
      sport: body.sport || 'nba',
      position: body.position || '',
      number: body.number || null,
      height: body.height || '',
      weight: body.weight || '',
      birthDate: body.birthDate || '',
      country: body.country || '',
      imageUrl: body.imageUrl || '',
      reviewCount: 0,
      summary: {},
      rank: 'F',
      draftYear: body.draftYear || null,
      draftRound: body.draftRound || null,
      draftPick: body.draftPick || null,
      stats: body.stats || null,
      contractAmount: body.contractAmount || null,
      contractYears: body.contractYears || null,
      shopUrl: body.shopUrl || null,
    };

    // Firestoreに保存（Admin SDK使用）
    await createPlayerAdmin(playerData);

    return NextResponse.json({
      success: true,
      player: playerData,
      message: '選手を追加しました',
    });
  } catch (error) {
    console.error('選手の追加に失敗:', error);
    return NextResponse.json(
      { 
        error: '選手の追加に失敗しました', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

/**
 * 選手を更新するAPI（Admin SDK使用）
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    if (!body.playerId || !body.name || !body.team) {
      return NextResponse.json(
        { error: '必須フィールド（playerId, name, team）が不足しています' },
        { status: 400 }
      );
    }

    const playerData: Player = {
      playerId: body.playerId,
      name: body.name,
      team: body.team,
      sport: body.sport || 'nba',
      position: body.position || '',
      number: body.number || null,
      height: body.height || '',
      weight: body.weight || '',
      birthDate: body.birthDate || '',
      country: body.country || '',
      imageUrl: body.imageUrl || '',
      reviewCount: body.reviewCount || 0,
      summary: body.summary || {},
      rank: body.rank || 'F',
      draftYear: body.draftYear || null,
      draftRound: body.draftRound || null,
      draftPick: body.draftPick || null,
      stats: body.stats || null,
      contractAmount: body.contractAmount || null,
      contractYears: body.contractYears || null,
      shopUrl: body.shopUrl || null,
    };

    // Firestoreに更新（Admin SDK使用）
    await updatePlayerAdmin(playerData);

    return NextResponse.json({
      success: true,
      player: playerData,
      message: '選手情報を更新しました',
    });
  } catch (error) {
    console.error('選手の更新に失敗:', error);
    return NextResponse.json(
      { 
        error: '選手の更新に失敗しました', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

/**
 * 選手を削除するAPI（Admin SDK使用）
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const playerId = searchParams.get('playerId');
    
    if (!playerId) {
      return NextResponse.json(
        { error: 'playerIdが必要です' },
        { status: 400 }
      );
    }

    // Firestoreから削除（Admin SDK使用）
    await deletePlayerAdmin(playerId);

    return NextResponse.json({
      success: true,
      message: '選手を削除しました',
    });
  } catch (error) {
    console.error('選手の削除に失敗:', error);
    return NextResponse.json(
      { 
        error: '選手の削除に失敗しました', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}



