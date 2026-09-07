import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  try {
    // Rate limit: 100 per minute per IP (public endpoint)
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const { success, reset } = await checkRateLimit("widget", ip);
    if (!success) {
      return rateLimitResponse(reset);
    }

    const { locationId } = await params;
    const supabase = getServiceClient();

    const { data: location, error: locError } = await supabase
      .from("locations")
      .select("id, name, address, rating, total_reviews, google_place_id, google_maps_url")
      .eq("id", locationId)
      .single();

    if (locError || !location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    const { data: config } = await supabase
      .from("widget_configs")
      .select("theme, primary_color, font_family, hide_watermark, widget_type, sort_by")
      .eq("location_id", locationId)
      .single();

    const { data: cache } = await supabase
      .from("reviews_cache")
      .select("raw_reviews, last_synced_at")
      .eq("location_id", locationId)
      .single();

    return NextResponse.json(
      {
        location,
        config: config || {
          theme: "light",
          primary_color: "#3b82f6",
          font_family: "Inter",
          hide_watermark: false,
          widget_type: "list",
          sort_by: "best",
        },
        reviews: cache?.raw_reviews || [],
        last_synced: cache?.last_synced_at || null,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/widget error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
