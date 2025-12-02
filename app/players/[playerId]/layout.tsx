import type { Metadata } from 'next';
import { getPlayer } from '@/lib/firebase/firestore';

interface PlayerLayoutProps {
  params: Promise<{ playerId: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: PlayerLayoutProps): Promise<Metadata> {
  const { playerId } = await params;
  const player = await getPlayer(playerId);
  
  if (!player) {
    return {
      title: '選手が見つかりません - Player Review',
      description: '指定された選手が見つかりません。',
    };
  }

  const reviewCount = player.reviewCount || 0;
  const summaryValues = Object.values(player.summary || {});
  const overallScore = summaryValues.length > 0 
    ? summaryValues.reduce((acc, val) => acc + val, 0) / summaryValues.length 
    : 0;

  const title = `${player.name} 評価・評判 | ${player.team} | Player Review`;
  const description = `${player.name}(${player.team})の評価・評判をチェック。ファンによる詳細なレビュー${reviewCount}件、総合評価${overallScore.toFixed(1)}/5.0。${player.position}としての実力や活躍ぶりをファンの声で確認できます。`;

  return {
    title,
    description,
    keywords: [
      player.name,
      `${player.name} 評価`,
      `${player.name} 評判`,
      `${player.name} レビュー`,
      player.team,
      'NBA',
      'バスケットボール',
      '選手評価',
      'ファンレビュー',
      player.position || '',
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: 'website',
      images: player.imageUrl ? [
        {
          url: player.imageUrl,
          width: 1040,
          height: 760,
          alt: `${player.name}の写真`,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: player.imageUrl ? [player.imageUrl] : [],
    },
    alternates: {
      canonical: `/players/${playerId}`,
    },
  };
}

export default function PlayerLayout({ children }: PlayerLayoutProps) {
  return <>{children}</>;
}
