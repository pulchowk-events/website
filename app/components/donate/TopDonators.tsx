'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Donator {
  id: number;
  name: string;
  amount: number;
  avatar_url: string | null;
}

interface TopDonatorsProps {
  donators: Donator[];
  limit?: number;
}

function formatUSD(n: number): string {
  return '$' + (n || 0).toLocaleString('en-US');
}

export default function TopDonators({ donators, limit = 5 }: TopDonatorsProps) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  const displayDonators = Array.isArray(donators) ? donators.slice(0, limit) : [];

  if (displayDonators.length === 0) {
    return (
      <p className="top-donators__empty">
        No donors yet, or all are anonymous. Be the first.
      </p>
    );
  }

  return (
    <ul className="top-donators">
      {displayDonators.map((donator, index) => (
        <li
          key={donator.id}
          className={'top-donators__row' + (animateIn ? ' top-donators__row--in' : '')}
          style={{ transitionDelay: index * 60 + 'ms' }}
        >
          <span className="top-donators__rank">{index + 1}</span>

          <span className="top-donators__avatar">
            {donator.avatar_url ? (
              <Image
                src={donator.avatar_url}
                alt={donator.name}
                width={32}
                height={32}
                className="top-donators__avatar-img"
              />
            ) : (
              <span className="top-donators__initial">
                {donator.name.charAt(0).toUpperCase()}
              </span>
            )}
          </span>

          <span className="top-donators__name">{donator.name}</span>
          <span className="top-donators__amount">{formatUSD(donator.amount)}</span>
        </li>
      ))}
    </ul>
  );
}
