'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { supabase } from "../lib/supabase";

export async function voteForProduct(productId: number, voteType: 'upvote' | 'downvote') {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Not authenticated");

  const userId = session.user?.id;
  const today = new Date().toISOString().split("T")[0]; // Get today's date

  // Check if the user already voted today for this product
  const { data: existingVote, error: fetchError } = await supabase
    .from("votes")
    .select()
    .eq("user_id", userId)
    .eq("product_id", productId)
    .gte("created_at", today)
    .limit(1);

  if (fetchError) throw fetchError;

  // If the user has voted today, return an error with the timestamp
  if (existingVote && existingVote.length > 0) {
    return {
      success: false,
      lastVoteTime: existingVote[0].created_at,
    };
  }

  // Record the vote (store upvote/downvote type)
  const { error: insertError } = await supabase.from("votes").insert({
    user_id: userId,
    product_id: productId,
    type: voteType, // Save whether it was an upvote or downvote
  });

  if (insertError) throw insertError;

  // Update product vote count (based on the vote type)
  const { error: updateError } = await supabase.rpc("increment_votes", {
    product_id: productId,
    type: voteType, // You may want to handle vote count separately for upvotes and downvotes
  });

  if (updateError) throw updateError;

  // Optionally, update the user's last voted time (this can be used for restricting votes after a certain time)
  const { error: updateUserVoteTimeError } = await supabase
    .from("users")
    .update({ last_voted_at: new Date() })
    .eq("id", userId);

  if (updateUserVoteTimeError) throw updateUserVoteTimeError;

  return {
    success: true,
  };
}
