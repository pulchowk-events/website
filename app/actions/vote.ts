'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { supabase } from "../lib/supabase";

export async function voteForProduct(productId: number) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Not authenticated");

  const userId = session.user?.id;
  const today = new Date().toISOString().split("T")[0];

  // Check if user already voted today
  const { data: existingVote, error: fetchError } = await supabase
    .from("votes")
    .select()
    .eq("user_id", userId)
    .eq("product_id", productId)
    .gte("created_at", today)
    .limit(1);

  if (fetchError) throw fetchError;
  if (existingVote && existingVote.length > 0) {
    return {
      success: false,
      lastVoteTime: existingVote[0].created_at
    }
  }

  // Record the vote
  const { error: insertError } = await supabase.from("votes").insert({
    user_id: userId,
    product_id: productId,
  });

  if (insertError) throw insertError;

  // Update product vote count
  const { error: updateError } = await supabase.rpc("increment_votes", {
    product_id: productId,
  });

  if (updateError) throw updateError;
}