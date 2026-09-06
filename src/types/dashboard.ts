export interface Location {
  id: string;
  name: string;
  address: string;
  rating: number;
  total_reviews: number;
  created_at: string;
}

export interface Review {
  author: string;
  rating: number;
  text: string;
  publishedAt: string;
}

export interface Analysis {
  top_positive: string;
  top_negative: string;
  positive_aspects: string[];
  negative_aspects: string[];
  sentiment: string;
  recommendation: string;
  instagram_copy: string;
  twitter_copy: string;
}

export interface FeedbackItem {
  id: string;
  rating: number;
  comment: string;
  contact: string;
  created_at: string;
}

export interface GbpReview {
  reviewId: string;
  author: string;
  rating: number;
  text: string;
  updateTime: string;
  reply: unknown;
}

export interface DisputeResult {
  is_disputable: boolean;
  confidence: number;
  violations: string[];
  reasoning: string;
  dispute_letter: string;
}
