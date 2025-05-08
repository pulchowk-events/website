'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { supabase } from "../lib/supabase";

export async function voteForProduct(productId: number, voteType: 'upvote' | 'downvote') {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error("voteForProduct: No session found");
      return { success: false, error: "Not authenticated" };
    }

    const userId = session.user?.id;
    const today = new Date().toISOString().split("T")[0];

    // Check if the user already voted today for this product
    const { data: existingVote, error: fetchError } = await supabase
      .from("votes")
      .select()
      .eq("user_id", userId)
      .eq("product_id", productId)
      .gte("created_at", today)
      .limit(1);

    if (fetchError) {
      console.error("voteForProduct: Failed to fetch existing vote", fetchError);
      return { success: false, error: "Failed to fetch existing vote" };
    }

    if (existingVote && existingVote.length > 0) {
      return {
        success: false,
        lastVoteTime: existingVote[0].created_at,
      };
    }

    // Record the vote
    const { error: insertError } = await supabase.from("votes").insert({
      user_id: userId,
      product_id: productId,
      type: voteType,
    });

    if (insertError) {
      console.error("voteForProduct: Failed to insert vote", insertError);
      return { success: false, error: "Failed to insert vote" };
    }

    // Update vote count via RPC
    const { error: updateError } = await supabase.rpc("increment_votes", {
      product_id: productId,
      type: voteType,
    });

    if (updateError) {
      console.error("voteForProduct: Failed to update vote count", updateError);
      return { success: false, error: "Failed to update vote count" };
    }

    // Optionally update last_voted_at
    const { error: updateUserVoteTimeError } = await supabase
      .from("users")
      .update({ last_voted_at: new Date() })
      .eq("id", userId);

    if (updateUserVoteTimeError) {
      console.error("voteForProduct: Failed to update user vote time", updateUserVoteTimeError);
      return { success: false, error: "Failed to update user vote time" };
    }

    return { success: true };
  } catch (err) {
    console.error("voteForProduct: Unexpected error", err);
    return { success: false, error: "Internal Server Error" };
  }
}
