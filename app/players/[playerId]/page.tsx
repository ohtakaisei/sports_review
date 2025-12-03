import { Metadata } from 'next';
import { getPlayer, getPlayerReviews } from '@/lib/firebase/firestore';
import PlayerDetailClient from './PlayerDetailClient';
import { generatePlayerTitle, generatePlayerDescription, generatePlayerKeywords } from '@/lib/utils/seo';

interface PageProps {
  params: Promise<{ playerId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { playerId } = await params;
  const player = await getPlayer(playerId);
  const reviews = await getPlayerReviews(playerId);

  if (!player) {
    return {
      title: '選手が見つかりません | Player Review',
      description: '指定された選手は見つかりませんでした。',
    };
  }

  return {
    title: generatePlayerTitle(player),
    description: generatePlayerDescription(player, reviews),
    keywords: generatePlayerKeywords(player),
    openGraph: {
      title: generatePlayerTitle(player),
      description: generatePlayerDescription(player, reviews),
      images: player.imageUrl ? [{ url: player.imageUrl }] : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: generatePlayerTitle(player),
      description: generatePlayerDescription(player, reviews),
      images: player.imageUrl ? [player.imageUrl] : [],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { playerId } = await params;
  const player = await getPlayer(playerId);
  const reviews = await getPlayerReviews(playerId);

  return (
    <PlayerDetailClient
      playerId={playerId}
      initialPlayer={player}
      initialReviews={reviews}
    />
  );
}
