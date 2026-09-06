import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a professional customer service representative for a business. Your task is to write a thoughtful, personalized reply to a customer review on Google Maps.

RULES:
- Reply in the SAME LANGUAGE as the review
- Keep it under 100 words
- Be warm and genuine, not robotic
- For positive reviews: thank them, mention something specific from their review, invite them back
- For negative reviews: apologize sincerely, acknowledge their specific complaint, explain how you'll fix it, invite them to contact you directly
- Never be defensive or dismissive
- Never make excuses
- Use the business name naturally
- End with a warm closing

Return ONLY the reply text, no quotes or formatting.`;

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

    const { review_text, review_author, review_rating, location_id } =
      await request.json();

    if (!review_text || !location_id) {
      return NextResponse.json(
        { error: "review_text and location_id are required" },
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
        { error: "AI Response requires Pro plan" },
        { status: 403 }
      );
    }

    // Get business name
    const { data: location } = await supabase
      .from("locations")
      .select("name")
      .eq("id", location_id)
      .single();

    const ratingStars = "⭐".repeat(review_rating || 5);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 200,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Business: ${location?.name || "Our business"}

Customer Review (${ratingStars}):
"${review_text}"

Customer name: ${review_author}

Write a professional reply to this review.`,
        },
      ],
    });

    const reply = completion.choices[0]?.message?.content;
    if (!reply) {
      return NextResponse.json(
        { error: "Failed to generate response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply: reply.trim() });
  } catch (error) {
    console.error("POST /api/respond error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
