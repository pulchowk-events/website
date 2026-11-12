import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getHomeStats } from "@/app/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const stats = await getHomeStats(session?.user?.id);
  return NextResponse.json(stats);
}
