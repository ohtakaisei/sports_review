import { Metadata } from 'next';
import { getPlayer, getPlayerReviews } from '@/lib/firebase/firestore';
import PlayerDetailClient from './PlayerDetailClient';
import { generatePlayerTitle, generatePlayerDescription, generatePlayerKeywords } from '@/lib/utils/seo';

interface PageProps {
  params: Promise<{ playerId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { playerId } = await params;
  // メタデータ用には最小限のデータのみ取得（クォータ節約）
  const player = await getPlayer(playerId);

  if (!player) {
    return {
      title: '選手が見つかりません | Player Review',
      description: '指定された選手は見つかりませんでした。',
    };
  }

  // メタデータ生成用の最小限の説明文
  const description = `${player.name}(${player.team})の評価・評判をチェック。ファンによる詳細なレビューと総合評価を確認できます。`;

  return {
    title: generatePlayerTitle(player),
    description,
    keywords: generatePlayerKeywords(player),
    openGraph: {
      title: generatePlayerTitle(player),
      description,
      images: player.imageUrl ? [{ url: player.imageUrl }] : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: generatePlayerTitle(player),
      description,
      images: player.imageUrl ? [player.imageUrl] : [],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { playerId } = await params;
  // ページ表示用のデータ取得（メタデータとは別）
  const playerRaw = await getPlayer(playerId);
  const reviewsRaw = await getPlayerReviews(playerId);

  // FirestoreのTimestampをシリアライズ可能な形式に変換
  // Client ComponentにはプレーンなJSONオブジェクトのみ渡せる
  const player = playerRaw ? JSON.parse(JSON.stringify(playerRaw)) : null;
  const reviews = JSON.parse(JSON.stringify(reviewsRaw));

  return (
    <PlayerDetailClient
      playerId={playerId}
      initialPlayer={player}
      initialReviews={reviews}
    />
  );
}
