import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are an elite brand strategist and marketing director specializing in local & physical businesses.
Your task is to analyze recent Google Maps reviews and extract high-value structured insights for the business owner.

STRICT RULE: Your response MUST BE ONLY a valid JSON object. No greetings, explanations, or markdown code blocks.
If you include text outside the JSON, the system will fail.

For social media copy: Craft professional, engaging, and authentic brand posts (not generic sales pitch or emoji spam). Highlight real customer appreciation, team dedication, and craft.

The JSON must exactly match this structure:
{
  "top_positive": "The single most praised aspect, in 6 words or less",
  "top_negative": "The single most criticized aspect, in 6 words or less. If no complaints, use empty string.",
  "positive_aspects": ["List of 3-5 top praised points, summarized in 6 words each"],
  "negative_aspects": ["List of 1-3 recurring complaints. If none, return empty array"],
  "sentiment": "positive" | "neutral" | "negative",
  "recommendation": "One actionable sentence for the owner based on the reviews",
  "instagram_copy": "Clean, authentic editorial caption celebrating customer satisfaction and craftsmanship. Warm, concise, and professional (max 60 words). Maximum 1-2 subtle emojis.",
  "twitter_copy": "Punchy, insightful single-thought post or hook (max 240 chars) reflecting brand standards and customer trust. Zero spam."
}`;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 10 AI calls per hour per user
    const { success, reset } = await checkRateLimit("ai", user.id);
    if (!success) {
      return rateLimitResponse(reset);
    }

    const { location_id } = await request.json();

    if (!location_id) {
      return NextResponse.json(
        { error: "location_id is required" },
        { status: 400 }
      );
    }

    // Check user plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_tier")
      .eq("id", user.id)
      .single();

    if (profile?.plan_tier !== "pro") {
      return NextResponse.json(
        { error: "AI analysis requires Pro plan" },
        { status: 403 }
      );
    }

    // Get reviews cache
    const { data: cache } = await supabase
      .from("reviews_cache")
      .select("raw_reviews, location_id")
      .eq("location_id", location_id)
      .single();

    if (!cache) {
      return NextResponse.json(
        { error: "No reviews found. Sync your location first." },
        { status: 404 }
      );
    }

    // Get location name
    const { data: location } = await supabase
      .from("locations")
      .select("name")
      .eq("id", location_id)
      .single();

    const reviews = cache.raw_reviews as Array<{
      author: string;
      rating: number;
      text: string;
    }>;

    if (!reviews || reviews.length === 0) {
      return NextResponse.json(
        { error: "No reviews to analyze" },
        { status: 400 }
      );
    }

    // Format reviews for the LLM
    const reviewsText = reviews
      .map((r) => `[${r.rating}/5 stars] ${r.author}: ${r.text}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze these reviews for the business "${location?.name}":\n\n${reviewsText}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "Failed to generate analysis" },
        { status: 500 }
      );
    }

    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 500 }
      );
    }

    // Save analysis
    await supabase
      .from("reviews_cache")
      .update({ llm_analysis: analysis })
      .eq("location_id", location_id);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("POST /api/analyze error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
