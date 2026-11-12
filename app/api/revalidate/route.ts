import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

// POST /api/revalidate
// Body: { tags: string[] }
// Header: X-Revalidate-Secret: <REVALIDATE_SECRET>
//
// Called by the bot after website-sync writes new events. Clears the ISR
// cache for the given tags so users see fresh data within seconds instead
// of waiting for the 60s window.

export async function POST(req: Request) {
  const secret = req.headers.get("x-revalidate-secret");
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected) {
    console.warn(
      "[revalidate] REVALIDATE_SECRET not set — rejecting all requests",
    );
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  if (!secret || secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { tags?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const ALLOWED_TAGS = new Set([
    "events",
    "products",
    "lounge",
    "donations",
    "sidebar",
    "admin-status",
    "scholarships",
  ]);

  const requestedTags =
    Array.isArray(body.tags) && body.tags.length > 0
      ? body.tags.filter((t) => ALLOWED_TAGS.has(t))
      : [];

  if (requestedTags.length === 0) {
    return NextResponse.json({ error: "no_valid_tags" }, { status: 400 });
  }

  for (const tag of requestedTags) {
    revalidateTag(tag, "max");
  }

  console.log(`[revalidate] Revalidated tags: ${requestedTags.join(", ")}`);

  return NextResponse.json({
    revalidated: requestedTags,
    at: new Date().toISOString(),
  });
}

// Reject GET — this is a mutation endpoint
export async function GET() {
  return NextResponse.json({ error: "method_not_allowed" }, { status: 405 });
}
