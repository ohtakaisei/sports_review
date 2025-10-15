import { MetadataRoute } from 'next';
import { getPlayers } from '@/lib/firebase/firestore';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  
  // 静的ページ
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/setup`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  try {
    // 選手ページを動的に生成
    const players = await getPlayers();
    const playerPages = players.map((player) => ({
      url: `${baseUrl}/players/${player.playerId}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...playerPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
