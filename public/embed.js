(function () {
  "use strict";

  const SCRIPT_TAG = document.currentScript;
  const LOCATION_ID = SCRIPT_TAG?.getAttribute("data-location-id");
  const WIDGET_TYPE = SCRIPT_TAG?.getAttribute("data-widget-type") || "list";

  if (!LOCATION_ID) {
    console.error("[StarPress] Missing data-location-id attribute");
    return;
  }

  const API_BASE = SCRIPT_TAG?.src?.replace(/\/embed\.js.*$/, "") || "";

  function createStars(rating) {
    return "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
  }

  function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // Review scoring algorithm
  function scoreReview(review) {
    let score = 0;
    const likes = review.likes || 0;
    score += Math.min(likes * 3, 30);
    if (review.rating >= 4) score += 25;
    else if (review.rating === 3) score += 10;
    else if (review.rating === 2) score += 3;
    const textLength = (review.text || "").length;
    score += Math.min(textLength / 10, 20);
    if (review.publishedAt) {
      const daysSince = (Date.now() - new Date(review.publishedAt).getTime()) / 86400000;
      score += Math.max(15 - daysSince * 0.3, 0);
    }
    if (review.isLocalGuide) score += 10;
    return Math.round(score * 10) / 10;
  }

  function sortReviews(reviews, mode) {
    const sorted = [...reviews];
    switch (mode) {
      case "recent":
        return sorted.sort((a, b) => {
          const dA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const dB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return dB - dA;
        });
      case "most_liked":
        return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case "highest":
        return sorted.sort((a, b) => b.rating - a.rating || scoreReview(b) - scoreReview(a));
      case "lowest":
        return sorted.sort((a, b) => a.rating - b.rating || scoreReview(b) - scoreReview(a));
      case "best":
      default:
        return sorted.sort((a, b) => scoreReview(b) - scoreReview(a));
    }
  }

  function getCarouselMix(reviews, limit) {
    limit = limit || 8;
    const positive = reviews.filter((r) => r.rating >= 4);
    const negative = reviews.filter((r) => r.rating <= 2);
    const neutral = reviews.filter((r) => r.rating === 3);
    const posCount = Math.ceil(limit * 0.7);
    const negCount = Math.floor(limit * 0.15);
    const neuCount = limit - posCount - negCount;
    const result = [
      ...sortReviews(positive, "best").slice(0, posCount),
      ...sortReviews(negative, "best").slice(0, negCount),
      ...sortReviews(neutral, "best").slice(0, neuCount),
    ];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function getStyles(theme, fontFamily) {
    const isDark = theme === "dark";
    return `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      .sp-widget { font-family: '${fontFamily}', sans-serif; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); border: 1px solid ${isDark ? "#374151" : "#e5e7eb"}; background: ${isDark ? "#111827" : "#ffffff"}; color: ${isDark ? "#f3f4f6" : "#111827"}; }

      /* Badge mode */
      .sp-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 9999px; font-family: '${fontFamily}', sans-serif; font-size: 14px; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,0.1); border: 1px solid ${isDark ? "#374151" : "#e5e7eb"}; background: ${isDark ? "#1f2937" : "#ffffff"}; color: ${isDark ? "#f9fafb" : "#111827"}; text-decoration: none; transition: all 0.2s; cursor: default; }
      .sp-badge:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.15); transform: translateY(-1px); }
      .sp-badge-star { color: #f59e0b; font-size: 16px; }
      .sp-badge-rating { font-weight: 700; }
      .sp-badge-text { opacity: 0.7; font-weight: 400; }
      .sp-badge-google { display: inline-flex; align-items: center; gap: 4px; }
      .sp-badge-google svg { width: 14px; height: 14px; }

      /* Header */
      .sp-header { padding: 20px; border-bottom: 1px solid ${isDark ? "#374151" : "#e5e7eb"}; }
      .sp-header h3 { margin: 0 0 4px 0; font-size: 18px; font-weight: 600; }
      .sp-header .sp-rating { display: flex; align-items: center; gap: 8px; font-size: 14px; opacity: 0.7; }
      .sp-stars { color: #f59e0b; letter-spacing: 2px; }

      /* List mode */
      .sp-reviews { max-height: 400px; overflow-y: auto; }
      .sp-review { padding: 16px 20px; border-bottom: 1px solid ${isDark ? "#374151" : "#e5e7eb"}; }
      .sp-review:last-child { border-bottom: none; }
      .sp-review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
      .sp-review-author { font-weight: 600; font-size: 14px; }
      .sp-review-stars { color: #f59e0b; font-size: 12px; letter-spacing: 1px; }
      .sp-review-text { font-size: 14px; line-height: 1.6; opacity: 0.85; }
      .sp-review-date { font-size: 12px; opacity: 0.5; margin-top: 4px; }

      /* Carousel mode */
      .sp-carousel { position: relative; overflow: hidden; }
      .sp-carousel-track { display: flex; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
      .sp-carousel-slide { min-width: 100%; padding: 32px 24px; }
      .sp-carousel-quote { font-size: 16px; line-height: 1.7; font-style: italic; margin-bottom: 20px; opacity: 0.9; }
      .sp-carousel-author { font-weight: 600; font-size: 14px; }
      .sp-carousel-date { font-size: 12px; opacity: 0.5; margin-top: 2px; }
      .sp-carousel-nav { display: flex; justify-content: center; align-items: center; gap: 12px; padding: 16px; border-top: 1px solid ${isDark ? "#374151" : "#e5e7eb"}; }
      .sp-carousel-btn { width: 32px; height: 32px; border-radius: 50%; border: 1px solid ${isDark ? "#4b5563" : "#d1d5db"}; background: ${isDark ? "#1f2937" : "#ffffff"}; color: ${isDark ? "#f3f4f6" : "#374151"}; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all 0.2s; }
      .sp-carousel-btn:hover { background: ${isDark ? "#374151" : "#f3f4f6"}; }
      .sp-carousel-dots { display: flex; gap: 6px; }
      .sp-carousel-dot { width: 8px; height: 8px; border-radius: 50%; border: none; cursor: pointer; transition: all 0.3s; background: ${isDark ? "#4b5563" : "#d1d5db"}; }
      .sp-carousel-dot.active { background: #3b82f6; width: 24px; border-radius: 4px; }

      /* Footer */
      .sp-footer { padding: 12px 20px; text-align: center; font-size: 12px; opacity: 0.5; border-top: 1px solid ${isDark ? "#374151" : "#e5e7eb"}; }
      .sp-footer a { color: inherit; text-decoration: none; font-weight: 500; }
      .sp-footer a:hover { text-decoration: underline; }

      /* Loading */
      .sp-loading { padding: 40px; text-align: center; opacity: 0.5; font-size: 14px; }
    `;
  }

  function renderListWidget(data) {
    const { location, config, reviews } = data;
    const fontFamily = config.font_family || "Inter";
    const sortBy = config.sort_by || "best";
    const sortedReviews = sortReviews(reviews, sortBy).slice(0, 10);

    let html = `<div class="sp-widget">`;
    html += `<div class="sp-header">`;
    html += `<h3>${escapeHtml(location.name)}</h3>`;
    html += `<div class="sp-rating"><span class="sp-stars">${createStars(location.rating)}</span><span>${location.rating} · ${location.total_reviews} reviews</span></div>`;
    html += `</div>`;
    html += `<div class="sp-reviews">`;
    for (const review of sortedReviews) {
      html += `<div class="sp-review">`;
      html += `<div class="sp-review-header"><span class="sp-review-author">${escapeHtml(review.author)}</span><span class="sp-review-stars">${createStars(review.rating)}</span></div>`;
      html += `<div class="sp-review-text">${escapeHtml(review.text)}</div>`;
      if (review.publishedAt) {
        html += `<div class="sp-review-date">${new Date(review.publishedAt).toLocaleDateString()}</div>`;
      }
      html += `</div>`;
    }
    html += `</div>`;
    if (!config.hide_watermark) {
      html += `<div class="sp-footer">Powered by <a href="https://starpress.app" target="_blank" rel="noopener">StarPress</a></div>`;
    }
    html += `</div>`;
    return html;
  }

  function renderCarouselWidget(data) {
    const { location, config, reviews } = data;
    const fontFamily = config.font_family || "Inter";
    const carouselReviews = getCarouselMix(reviews, 8);

    let html = `<div class="sp-widget">`;
    html += `<div class="sp-header">`;
    html += `<h3>${escapeHtml(location.name)}</h3>`;
    html += `<div class="sp-rating"><span class="sp-stars">${createStars(location.rating)}</span><span>${location.rating} · ${location.total_reviews} reviews</span></div>`;
    html += `</div>`;
    html += `<div class="sp-carousel">`;
    html += `<div class="sp-carousel-track" id="sp-track">`;
    for (const review of carouselReviews) {
      html += `<div class="sp-carousel-slide">`;
      html += `<div class="sp-carousel-quote">&ldquo;${escapeHtml(review.text)}&rdquo;</div>`;
      html += `<div class="sp-carousel-author">${escapeHtml(review.author)}</div>`;
      if (review.publishedAt) {
        html += `<div class="sp-carousel-date">${new Date(review.publishedAt).toLocaleDateString()}</div>`;
      }
      html += `</div>`;
    }
    html += `</div>`;
    html += `<div class="sp-carousel-nav">`;
    html += `<button class="sp-carousel-btn" id="sp-prev">&#8249;</button>`;
    html += `<div class="sp-carousel-dots" id="sp-dots">`;
    for (let i = 0; i < carouselReviews.length; i++) {
      html += `<button class="sp-carousel-dot${i === 0 ? " active" : ""}" data-index="${i}"></button>`;
    }
    html += `</div>`;
    html += `<button class="sp-carousel-btn" id="sp-next">&#8250;</button>`;
    html += `</div>`;
    html += `</div>`;
    if (!config.hide_watermark) {
      html += `<div class="sp-footer">Powered by <a href="https://starpress.app" target="_blank" rel="noopener">StarPress</a></div>`;
    }
    html += `</div>`;
    return html;
  }

  function initCarouselLogic(shadowRoot) {
    const track = shadowRoot.querySelector("#sp-track");
    const prevBtn = shadowRoot.querySelector("#sp-prev");
    const nextBtn = shadowRoot.querySelector("#sp-next");
    const dots = shadowRoot.querySelectorAll(".sp-carousel-dot");
    if (!track || !prevBtn || !nextBtn) return;

    let current = 0;
    const total = dots.length;
    let autoPlay;

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle("active", i === current));
    }

    prevBtn.addEventListener("click", () => { goTo(current - 1); resetAutoPlay(); });
    nextBtn.addEventListener("click", () => { goTo(current + 1); resetAutoPlay(); });
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        goTo(parseInt(dot.getAttribute("data-index")));
        resetAutoPlay();
      });
    });

    function resetAutoPlay() {
      clearInterval(autoPlay);
      autoPlay = setInterval(() => goTo(current + 1), 5000);
    }
    resetAutoPlay();
  }

  function renderBadgeWidget(data) {
    const { location, config } = data;
    const fontFamily = config.font_family || "Inter";
    const theme = config.theme || "light";
    const isDark = theme === "dark";

    const googleIcon = `<svg viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`;

    let html = `<div class="sp-badge" style="font-family: '${fontFamily}', sans-serif;">`;
    html += `<span class="sp-badge-star">★</span>`;
    html += `<span class="sp-badge-rating">${location.rating}</span>`;
    html += `<span class="sp-badge-google">${googleIcon}</span>`;
    html += `<span class="sp-badge-text">on Google</span>`;
    html += `</div>`;

    return html;
  }

  function renderWidget(data) {
    const { config } = data;
    const host = document.createElement("div");
    const fontFamily = config.font_family || "Inter";

    const shadow = host.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = getStyles(config.theme || "light", fontFamily);
    shadow.appendChild(style);

    const wrapper = document.createElement("div");
    const widgetType = WIDGET_TYPE;

    if (widgetType === "badge") {
      wrapper.innerHTML = renderBadgeWidget(data);
    } else if (widgetType === "carousel") {
      wrapper.innerHTML = renderCarouselWidget(data);
    } else {
      wrapper.innerHTML = renderListWidget(data);
    }
    shadow.appendChild(wrapper);

    if (widgetType === "carousel") {
      initCarouselLogic(shadow);
    }

    return host;
  }

  function injectSchema(data) {
    const { location, reviews } = data;
    if (!location || !location.name) return;

    const reviewCount = (reviews || []).length;
    const rating = location.rating || 0;
    const totalReviews = location.total_reviews || reviewCount;

    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: location.name,
      address: location.address || undefined,
      url: location.google_maps_url || undefined,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating,
        reviewCount: totalReviews,
        bestRating: 5,
        worstRating: 1,
      },
      review: (reviews || []).slice(0, 10).map((r) => ({
        "@type": "Review",
        author: {
          "@type": "Person",
          name: r.author || "Anonymous",
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating || 5,
          bestRating: 5,
        },
        reviewBody: r.text || "",
        datePublished: r.publishedAt || undefined,
      })),
    };

    // Remove undefined values
    Object.keys(schema).forEach((key) => {
      if (schema[key] === undefined) delete schema[key];
    });

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    script.setAttribute("data-starpress-schema", "true");

    // Remove existing StarPress schema if any
    const existing = document.querySelector('[data-starpress-schema="true"]');
    if (existing) existing.remove();

    document.head.appendChild(script);
  }

  function init() {
    const container = document.createElement("div");
    container.innerHTML = '<div class="sp-loading">Loading reviews...</div>';
    SCRIPT_TAG.parentNode.insertBefore(container, SCRIPT_TAG.nextSibling);

    fetch(`${API_BASE}/api/widget/${LOCATION_ID}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load widget");
        return res.json();
      })
      .then((data) => {
        container.innerHTML = "";
        const widget = renderWidget(data);
        container.appendChild(widget);

        // Inject SEO schema into host page
        injectSchema(data);
      })
      .catch((err) => {
        console.error("[StarPress]", err);
        container.innerHTML = '<div class="sp-loading">Failed to load reviews.</div>';
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
