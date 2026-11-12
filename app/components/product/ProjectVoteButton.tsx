"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { useVotes } from "@/app/lib/VoteContext";
import SignInModal from "@/app/components/signIn/SignInModal";

interface Props {
  productId: number;
  initialVotes: number;
}

export function ProjectVoteButton({ productId, initialVotes }: Props) {
  const { data: session } = useSession();
  const { productVotes, userVotes, canVote, isAdmin, timeRemaining, handleVote, loadingStates } = useVotes();
  const [signInOpen, setSignInOpen] = useState(false);

  const ctx = productVotes[productId];
  const score = ctx ? ctx.upvotes - ctx.downvotes : initialVotes;
  const userVote = userVotes[productId];
  const loading = loadingStates[productId] || false;
  const cooldown = !!session?.user?.id && !canVote && !isAdmin && !!timeRemaining;

  const cast = (e: React.MouseEvent, type: "upvote" | "downvote") => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user?.id) {
      setSignInOpen(true);
      return;
    }
    handleVote(productId, type);
  };

  const title = cooldown && timeRemaining ? "Next vote in " + timeRemaining : undefined;

  return (
    <>
      <div className="pvcol" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={(e) => cast(e, "upvote")}
          disabled={loading}
          className={
            "pvcol__btn pvcol__btn--up" +
            (userVote === "upvote" ? " pvcol__btn--on" : "") +
            (cooldown ? " pvcol__btn--cooldown" : "")
          }
          title={title}
          aria-label="Upvote"
          aria-pressed={userVote === "upvote"}
        >
          <ArrowBigUp size={16} fill={userVote === "upvote" ? "currentColor" : "none"} />
        </button>

        <span className="pvcol__score">{score}</span>

        <button
          type="button"
          onClick={(e) => cast(e, "downvote")}
          disabled={loading}
          className={
            "pvcol__btn pvcol__btn--down" +
            (userVote === "downvote" ? " pvcol__btn--down-on" : "") +
            (cooldown ? " pvcol__btn--cooldown" : "")
          }
          title={title}
          aria-label="Downvote"
          aria-pressed={userVote === "downvote"}
        >
          <ArrowBigDown size={16} fill={userVote === "downvote" ? "currentColor" : "none"} />
        </button>
      </div>
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
