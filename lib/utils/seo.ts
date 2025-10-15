import { Player, Review } from '@/lib/types';

/**
 * 選手詳細ページ用のSEOタイトルを生成
 */
export function generatePlayerTitle(player: Player): string {
  return `${player.name} 評価・評判 | ${player.team} | Player Review`;
}

/**
 * 選手詳細ページ用のSEO説明文を生成
 */
export function generatePlayerDescription(player: Player, reviews: Review[]): string {
  const reviewCount = reviews.length;
  const summaryValues = Object.values(player.summary || {});
  const overallScore = summaryValues.length > 0 
    ? summaryValues.reduce((acc, val) => acc + val, 0) / summaryValues.length 
    : 0;

  return `${player.name}(${player.team})の評価・評判をチェック。ファンによる詳細なレビュー${reviewCount}件、総合評価${overallScore.toFixed(1)}/5.0。${player.position}としての実力や活躍ぶりをファンの声で確認できます。`;
}

/**
 * 選手詳細ページ用のキーワードを生成
 */
export function generatePlayerKeywords(player: Player): string[] {
  const keywords = [
    player.name,
    `${player.name} 評価`,
    `${player.name} 評判`,
    `${player.name} レビュー`,
    `${player.name} ファン`,
    player.team,
    'NBA',
    'バスケットボール',
    '選手評価',
    'ファンレビュー',
    'スポーツ評価',
  ];

  if (player.position) {
    keywords.push(player.position);
    keywords.push(`${player.name} ${player.position}`);
  }

  if (player.country) {
    keywords.push(player.country);
  }

  return keywords.filter(Boolean);
}

/**
 * 構造化データ（JSON-LD）を生成
 */
export function generateStructuredData(player: Player, reviews: Review[]): object {
  const summaryValues = Object.values(player.summary || {});
  const overallScore = summaryValues.length > 0 
    ? summaryValues.reduce((acc, val) => acc + val, 0) / summaryValues.length 
    : 0;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": player.name,
    "jobTitle": player.position,
    "worksFor": {
      "@type": "SportsTeam",
      "name": player.team
    },
    "sport": "Basketball",
    "league": "NBA",
    "image": player.imageUrl,
    "birthDate": player.birthDate,
    "nationality": player.country,
    "height": player.height,
    "weight": player.weight,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": overallScore.toFixed(1),
      "ratingCount": player.reviewCount || 0,
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": reviews.slice(0, 5).map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.overallScore,
        "bestRating": "5",
        "worstRating": "1"
      },
      "reviewBody": review.comment,
      "author": {
        "@type": "Person",
        "name": review.userName || "匿名ユーザー"
      },
      "datePublished": review.createdAt
    }))
  };
}
