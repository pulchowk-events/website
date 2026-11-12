import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getRailData, type RailContext } from "@/app/lib/queries";

const VALID: RailContext[] = [
  "home",
  "lounge",
  "events",
  "jobs",
  "projects",
  "donate",
  "utility",
];

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ context: string }> },
) {
  const { context } = await params;
  if (!VALID.includes(context as RailContext)) {
    return NextResponse.json({ error: "Unknown rail context" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const data = await getRailData(context as RailContext, session?.user?.id);
  return NextResponse.json(data);
}
