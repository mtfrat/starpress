import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DISPUTE_SYSTEM_PROMPT = `You are a legal assistant specializing in Google Business Profile review disputes.

Analyze the review text against Google's content policies. Google removes reviews that violate:
1. Spam or fake content
2. Off-topic reviews
3. Restricted content
4. Illegal content
5. Sexually explicit content
6. Offensive content
7. Dangerous content
8. Impersonation
9. Conflict of interest (competitor reviews)

For the given review, provide:
- "is_disputable": boolean — whether this review likely violates Google's policies
- "confidence": number (0-100) — how confident you are this violates policies
- "violations": string[] — which specific Google policies this review likely violates
- "reasoning": string — brief explanation of why this review is disputable
- "dispute_letter": string — a formal, professional dispute letter the business owner can copy and paste into Google's support form. The letter should:
  - Reference the specific review (author name, date if available)
  - Cite the specific Google policy violations
  - Request removal under those policies
  - Be written in English (Google's support language)
  - Be under 300 words
  - Use formal but clear language

Return JSON only.`;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { review_text, review_author, review_rating, review_date } =
      await request.json();

    if (!review_text) {
      return NextResponse.json(
        { error: "review_text is required" },
        { status: 400 }
      );
    }

    // Check plan tier
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_tier")
      .eq("id", user.id)
      .single();

    if (profile?.plan_tier !== "pro") {
      return NextResponse.json(
        { error: "Dispute analysis requires Pro plan" },
        { status: 403 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: DISPUTE_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Review author: ${review_author || "Anonymous"}
Rating: ${review_rating}/5
Date: ${review_date || "Unknown"}
Review text: "${review_text}"

Analyze this review for policy violations and generate a dispute letter if applicable.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "Failed to generate dispute analysis" },
        { status: 500 }
      );
    }

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/dispute error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
