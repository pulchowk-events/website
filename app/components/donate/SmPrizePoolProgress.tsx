'use client';

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import DonateButton from './DonateButton';

interface PrizePoolProgressProps {
  currentAmount: number;
  targetAmount: number;
  totalDonors: number;
}

export default function PrizePoolProgress({
  currentAmount,
  targetAmount,
  totalDonors,
}: PrizePoolProgressProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  const progressPercentage = Math.min(100, (currentAmount / targetAmount) * 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(progressPercentage);
    }, 200);

    return () => clearTimeout(timer);
  }, [progressPercentage]);

  return (
    <div className="bg-card/50 rounded-lg shadow-md border border-border p-3 space-y-3 w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-foreground">Investment Prize Pool</h2>
        <p className="text-xs text-muted-foreground">
          Help fund the next generation of developers & entrepreneurs.
        </p>
      </div>

      <div className="flex justify-between items-center text-sm">
        <div className="flex flex-col">
          <span className="text-foreground text-lg font-bold">
            ${currentAmount.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-xs">
            raised of ${targetAmount.toLocaleString()} goal
          </span>
        </div>
      </div>

      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${animatedWidth}%` }}
        />
      </div>
    </div>
  );
}