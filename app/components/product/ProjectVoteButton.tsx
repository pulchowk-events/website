"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowBigUp } from "lucide-react";
import { useVotes } from "@/app/lib/VoteContext";
import SignInModal from "@/app/components/signIn/SignInModal";

interface Props {
  productId: number;
  initialVotes: number;
}

export function ProjectVoteButton({ productId, initialVotes }: Props) {
  const { data: session } = useSession();
  const { productVotes, userVotes, canVote, timeRemaining, handleVote, loadingStates } = useVotes();
  const [signInOpen, setSignInOpen] = useState(false);

  const ctx = productVotes[productId];
  const upvotes = ctx ? ctx.upvotes : initialVotes;
  const score = upvotes;
  const userVote = userVotes[productId];
  const loading = loadingStates[productId] || false;
  const cooldown = !!session?.user?.id && !canVote && !!timeRemaining;

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user?.id) {
      setSignInOpen(true);
      return;
    }
    handleVote(productId, "upvote");
  };

  return (
    <>
      <button
        type="button"
        className={
          "pv" +
          (userVote === "upvote" ? " pv--on" : "") +
          (cooldown ? " pv--cooldown" : "")
        }
        onClick={onClick}
        disabled={loading}
        title={cooldown && timeRemaining ? "Next vote in " + timeRemaining : "Upvote"}
        aria-label="Upvote"
        aria-pressed={userVote === "upvote"}
      >
        <ArrowBigUp size={16} className="pv__icon" fill={userVote === "upvote" ? "currentColor" : "none"} />
        <span className="pv__score">{score}</span>
      </button>
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
