import { useVotes } from '@/app/lib/VoteContext';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function VoteCooldownNotice() {
  const { data: session } = useSession();
  const { isAdmin, timeRemaining, canVote } = useVotes();
  const [remainingTime, setRemainingTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (canVote || isAdmin || !timeRemaining) return;

    const parseTimeRemaining = () => {
      const match = timeRemaining.match(/(\d+)h\s+(\d+)m/);
      if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        return { hours, minutes };
      }
      return { hours: 0, minutes: 0 };
    };

    const calculateRemainingSeconds = () => {
      const { hours, minutes } = parseTimeRemaining();
      const totalSeconds = hours * 3600 + minutes * 60;

      const now = new Date();
      const seconds = 59 - now.getSeconds();

      setRemainingTime({ hours, minutes, seconds });
      return totalSeconds > 0;
    };

    const hasTimeRemaining = calculateRemainingSeconds();

    let interval: ReturnType<typeof setInterval> | undefined;

    if (hasTimeRemaining) {
      interval = setInterval(() => {
        const stillHasTime = calculateRemainingSeconds();
        if (!stillHasTime && interval) {
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRemaining, canVote, isAdmin]);

  if (canVote || !timeRemaining || isAdmin) return null;

  return (
    <div className="bg-card border border-border text-muted-foreground h-10 flex flex-row gap-2 items-center py-2 px-4 rounded-full transition text-sm w-fit font-medium">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
          <path d="M10 2h4m-2 12l3-3" />
          <circle cx="12" cy="14" r="8" />
        </g>
      </svg>
      <span className="font-semibold text-foreground">
        {remainingTime.hours}h {remainingTime.minutes}m {remainingTime.seconds}s
      </span>
    </div>
  );
}