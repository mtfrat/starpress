import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // user_id
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard?gbp_error=${error}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/dashboard?gbp_error=missing_params", request.url)
      );
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_GBP_CLIENT_ID!,
        client_secret: process.env.GOOGLE_GBP_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/gbp/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error("Token exchange error:", errText);
      return NextResponse.redirect(
        new URL("/dashboard?gbp_error=token_exchange_failed", request.url)
      );
    }

    const tokens = await tokenResponse.json();

    // Fetch user's GBP accounts
    const accountsResponse = await fetch(
      "https://mybusinessbusinessinformation.googleapis.com/v1/accounts",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );

    let accountId = "";
    let locationId = "";
    let businessName = "";

    if (accountsResponse.ok) {
      const accounts = await accountsResponse.json();
      const accountsList = accounts.accounts || [];

      if (accountsList.length > 0) {
        accountId = accountsList[0].name.replace("accounts/", "");

        // Fetch locations for this account
        const locationsResponse = await fetch(
          `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations`,
          {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
          }
        );

        if (locationsResponse.ok) {
          const locations = await locationsResponse.json();
          const locationsList = locations.locations || [];

          if (locationsList.length > 0) {
            locationId = locationsList[0].name.replace("locations/", "");
            businessName = locationsList[0].locationName || "";
          }
        }
      }
    }

    // Save tokens to database
    const supabase = getServiceClient();

    const { error: dbError } = await supabase.from("gbp_tokens").upsert(
      {
        profile_id: state,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_expiry: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        account_id: accountId,
        location_id: locationId,
        business_name: businessName,
      },
      { onConflict: "profile_id" }
    );

    if (dbError) {
      console.error("DB error saving GBP tokens:", dbError);
    }

    return NextResponse.redirect(
      new URL("/dashboard?gbp_connected=true", request.url)
    );
  } catch (error) {
    console.error("GBP callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?gbp_error=internal_error", request.url)
    );
  }
}
