import { NextResponse } from "next/server";
import { emails } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await emails.welcome(email, name);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Email] Welcome email failed:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
