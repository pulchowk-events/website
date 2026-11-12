import { useVotes } from '@/app/lib/VoteContext';
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export default function VoteCooldownNotice() {
  const { isAdmin, timeRemaining, canVote } = useVotes();
  const [remaining, setRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (canVote || isAdmin || !timeRemaining) return;

    const parse = () => {
      const match = timeRemaining.match(/(\d+)h\s+(\d+)m/);
      if (match) {
        return { hours: parseInt(match[1], 10), minutes: parseInt(match[2], 10) };
      }
      return { hours: 0, minutes: 0 };
    };

    const tick = () => {
      const { hours, minutes } = parse();
      const seconds = 59 - new Date().getSeconds();
      setRemaining({ hours, minutes, seconds });
      return hours * 3600 + minutes * 60 > 0;
    };

    const hasTime = tick();
    let interval: ReturnType<typeof setInterval> | undefined;
    if (hasTime) {
      interval = setInterval(() => {
        if (!tick() && interval) clearInterval(interval);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRemaining, canVote, isAdmin]);

  if (canVote || !timeRemaining || isAdmin) return null;

  return (
    <div className="cooldown">
      <Clock size={14} />
      <span className="cooldown__label">Next vote in</span>
      <span className="cooldown__time" suppressHydrationWarning>
        {remaining.hours}h {remaining.minutes}m {remaining.seconds}s
      </span>
    </div>
  );
}
