export interface Review {
  author: string;
  rating: number;
  text: string;
  publishedAt: string;
  likes?: number;
  isLocalGuide?: boolean;
  language?: string;
}

export type SortMode = "best" | "recent" | "most_liked" | "highest" | "lowest";

/**
 * Score a review based on multiple factors.
 * Higher score = more valuable to display.
 */
export function scoreReview(review: Review): number {
  let score = 0;

  // Likes (0-30 pts) — community validation
  const likes = review.likes || 0;
  score += Math.min(likes * 3, 30);

  // Rating quality (0-25 pts) — high ratings are more persuasive
  if (review.rating >= 4) score += 25;
  else if (review.rating === 3) score += 10;
  else if (review.rating === 2) score += 3;

  // Text length (0-20 pts) — detailed reviews are more convincing
  const textLength = (review.text || "").length;
  score += Math.min(textLength / 10, 20);

  // Recency (0-15 pts) — newer reviews matter more
  if (review.publishedAt) {
    const daysSince = (Date.now() - new Date(review.publishedAt).getTime()) / 86400000;
    score += Math.max(15 - daysSince * 0.3, 0);
  }

  // Local guide bonus (0-10 pts)
  if (review.isLocalGuide) score += 10;

  return Math.round(score * 10) / 10;
}

/**
 * Sort reviews based on the selected mode.
 */
export function sortReviews(reviews: Review[], mode: SortMode): Review[] {
  const sorted = [...reviews];

  switch (mode) {
    case "best":
      return sorted.sort((a, b) => scoreReview(b) - scoreReview(a));

    case "recent":
      return sorted.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      });

    case "most_liked":
      return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));

    case "highest":
      return sorted.sort((a, b) => b.rating - a.rating || scoreReview(b) - scoreReview(a));

    case "lowest":
      return sorted.sort((a, b) => a.rating - b.rating || scoreReview(b) - scoreReview(a));

    default:
      return sorted;
  }
}

/**
 * Get a mixed set for carousel: mostly positive with some negative to show responsiveness.
 */
export function getCarouselMix(reviews: Review[], limit: number = 8): Review[] {
  const positive = reviews.filter((r) => r.rating >= 4);
  const negative = reviews.filter((r) => r.rating <= 2);
  const neutral = reviews.filter((r) => r.rating === 3);

  // 70% positive, 15% negative, 15% neutral
  const posCount = Math.ceil(limit * 0.7);
  const negCount = Math.floor(limit * 0.15);
  const neuCount = limit - posCount - negCount;

  const result: Review[] = [
    ...sortReviews(positive, "best").slice(0, posCount),
    ...sortReviews(negative, "best").slice(0, negCount),
    ...sortReviews(neutral, "best").slice(0, neuCount),
  ];

  // Shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
