"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import SignInModal from "@/app/components/signIn/SignInModal";

interface Props {
  postId: string;
  initialScore: number;
  initialVote: 1 | -1 | undefined;
}

export function PostVoteButton({ postId, initialScore, initialVote }: Props) {
  const { data: session } = useSession();
  const [score, setScore] = useState(initialScore);
  const [vote, setVote] = useState<1 | -1 | undefined>(initialVote);
  const [signInOpen, setSignInOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const cast = async (target: 1 | -1) => {
    if (!session?.user?.id) {
      setSignInOpen(true);
      return;
    }
    if (pending) return;

    const prevScore = score;
    const prevVote = vote;
    const nextValue = vote === target ? 0 : target;
    const delta = (nextValue === 0 ? 0 : nextValue) - (vote ?? 0);

    setVote(nextValue === 0 ? undefined : nextValue);
    setScore(prevScore + delta);
    setPending(true);

    try {
      const res = await fetch("/api/lounge/vote", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, value: nextValue }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setScore(data.score ?? prevScore + delta);
    } catch {
      setVote(prevVote);
      setScore(prevScore);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <div className="pvcol" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => cast(1)}
          className={"pvcol__btn pvcol__btn--up" + (vote === 1 ? " pvcol__btn--on" : "")}
          aria-label="Upvote"
          aria-pressed={vote === 1}
        >
          <ArrowBigUp size={16} fill={vote === 1 ? "currentColor" : "none"} />
        </button>
        <span className="pvcol__score">{score}</span>
        <button
          type="button"
          onClick={() => cast(-1)}
          className={"pvcol__btn pvcol__btn--down" + (vote === -1 ? " pvcol__btn--down-on" : "")}
          aria-label="Downvote"
          aria-pressed={vote === -1}
        >
          <ArrowBigDown size={16} fill={vote === -1 ? "currentColor" : "none"} />
        </button>
      </div>
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
