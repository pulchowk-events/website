import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export const dynamic = "force-dynamic";

interface Result {
  type: "post" | "event" | "job" | "project";
  id: string;
  title: string;
  meta?: string;
  href: string;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const limit = Math.min(10, parseInt(url.searchParams.get("limit") || "3", 10) || 3);
  if (!q) return NextResponse.json({ results: [] });

  const safe = q.replace(/[%_\\\\]/g, "\\\\$&");
  const ilike = "%" + safe + "%";

  const [posts, events, jobs, products] = await Promise.all([
    supabase.from("lounge_posts").select("id, title").ilike("title", ilike).limit(limit),
    supabase.from("events").select("id, title, event_date").eq("verified", true).ilike("title", ilike).limit(limit),
    supabase.from("jobs").select("id, title, company").eq("verified", true).or("title.ilike." + ilike + ",company.ilike." + ilike).limit(limit),
    supabase.from("products").select("id, name, url").eq("approved", true).ilike("name", ilike).limit(limit),
  ]);

  const results: Result[] = [];
  (posts.data || []).forEach((p: any) => results.push({ type: "post", id: p.id, title: p.title, href: "/lounge/" + p.id }));
  (events.data || []).forEach((e: any) => results.push({ type: "event", id: e.id, title: e.title, meta: "Event", href: "/events/" + e.id }));
  (jobs.data || []).forEach((j: any) => results.push({ type: "job", id: j.id, title: j.title, meta: j.company, href: "/jobs/" + j.id }));
  (products.data || []).forEach((p: any) => results.push({ type: "project", id: String(p.id), title: p.name, href: "/product-hunt/" + p.url }));

  return NextResponse.json({ results });
}
