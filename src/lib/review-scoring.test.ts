import { describe, it, expect } from "vitest";
import {
  scoreReview,
  sortReviews,
  getCarouselMix,
  type Review,
} from "./review-scoring";

describe("scoreReview", () => {
  it("scores a high-quality review highly", () => {
    const review: Review = {
      author: "John",
      rating: 5,
      text: "This is a detailed review with enough text to score well on length. ",

      publishedAt: new Date().toISOString(),
      likes: 10,
      isLocalGuide: true,
    };

    const score = scoreReview(review);
    expect(score).toBeGreaterThan(70);
  });

  it("scores a low-quality review poorly", () => {
    const review: Review = {
      author: "Jane",
      rating: 1,
      text: "Bad",
      publishedAt: "2020-01-01",
      likes: 0,
      isLocalGuide: false,
    };

    const score = scoreReview(review);
    expect(score).toBeLessThan(20);
  });

  it("scores a 3-star review in the middle range", () => {
    const review: Review = {
      author: "Bob",
      rating: 3,
      text: "It was okay. Nothing special but not terrible either.",
      publishedAt: new Date().toISOString(),
      likes: 5,
    };

    const score = scoreReview(review);
    expect(score).toBeGreaterThanOrEqual(30);
    expect(score).toBeLessThanOrEqual(60);
  });

  it("adds local guide bonus", () => {
    const base: Review = {
      author: "Test",
      rating: 4,
      text: "Good place",
      publishedAt: new Date().toISOString(),
      likes: 0,
      isLocalGuide: false,
    };

    const withGuide: Review = { ...base, isLocalGuide: true };

    expect(scoreReview(withGuide)).toBeGreaterThan(scoreReview(base));
  });

  it("handles reviews with no publishedAt", () => {
    const review: Review = {
      author: "Test",
      rating: 4,
      text: "Good",
      publishedAt: "",
      likes: 0,
    };

    expect(() => scoreReview(review)).not.toThrow();
  });
});

describe("sortReviews", () => {
  const reviews: Review[] = [
    {
      author: "A",
      rating: 5,
      text: "Great!",
      publishedAt: "2026-01-01",
      likes: 10,
    },
    {
      author: "B",
      rating: 3,
      text: "Okay",
      publishedAt: "2026-06-01",
      likes: 5,
    },
    {
      author: "C",
      rating: 1,
      text: "Terrible",
      publishedAt: "2026-09-01",
      likes: 0,
    },
  ];

  it("sorts by best (score)", () => {
    const sorted = sortReviews(reviews, "best");
    expect(sorted[0].author).toBe("A");
  });

  it("sorts by recent", () => {
    const sorted = sortReviews(reviews, "recent");
    expect(sorted[0].author).toBe("C");
  });

  it("sorts by most_liked", () => {
    const sorted = sortReviews(reviews, "most_liked");
    expect(sorted[0].author).toBe("A");
  });

  it("sorts by highest rating", () => {
    const sorted = sortReviews(reviews, "highest");
    expect(sorted[0].rating).toBe(5);
  });

  it("sorts by lowest rating", () => {
    const sorted = sortReviews(reviews, "lowest");
    expect(sorted[0].rating).toBe(1);
  });

  it("does not mutate original array", () => {
    const original = [...reviews];
    sortReviews(reviews, "best");
    expect(reviews).toEqual(original);
  });
});

describe("getCarouselMix", () => {
  const reviews: Review[] = Array.from({ length: 20 }, (_, i) => ({
    author: `User ${i}`,
    rating: (i % 5) + 1,
    text: `Review ${i}`,
    publishedAt: new Date().toISOString(),
    likes: i,
  }));

  it("returns the requested number of reviews", () => {
    const result = getCarouselMix(reviews, 8);
    expect(result.length).toBe(8);
  });

  it("includes mostly positive reviews", () => {
    const result = getCarouselMix(reviews, 10);
    const positive = result.filter((r) => r.rating >= 4);
    expect(positive.length).toBeGreaterThanOrEqual(5);
  });

  it("includes some negative reviews", () => {
    const result = getCarouselMix(reviews, 10);
    const negative = result.filter((r) => r.rating <= 2);
    expect(negative.length).toBeGreaterThanOrEqual(1);
  });

  it("does not exceed available reviews", () => {
    const fewReviews = reviews.slice(0, 3);
    const result = getCarouselMix(fewReviews, 10);
    expect(result.length).toBeLessThanOrEqual(3);
  });
});
