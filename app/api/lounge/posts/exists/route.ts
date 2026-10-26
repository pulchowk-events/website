import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("lounge_posts")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error checking post existence:", error);
      return NextResponse.json({ exists: false }, { status: 500 });
    }

    return NextResponse.json({ exists: !!data });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
