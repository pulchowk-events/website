'use client';

import { useState, useEffect } from 'react';
import { Trophy, ChevronRight } from 'lucide-react';
import Link from 'next/link';
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

export default function TopDonators({ donators, limit = 5 }: TopDonatorsProps) {
  const [animateIn, setAnimateIn] = useState(false);
  
  useEffect(() => {
    setAnimateIn(true);
  }, []);
  
  const displayDonators = Array.isArray(donators) ? donators.slice(0, limit) : [];
  
  
  return (
    <div className="bg-zinc-800/50 rounded-lg shadow-lg border border-zinc-800/80 p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          Top Donors
        </h3>
        
      </div>
      
      <div className="space-y-4">
        {displayDonators.length > 0 ? (
          displayDonators.map((donator, index) => (
            <div 
              key={donator.id}
              className={`flex items-center justify-between transition-all duration-300 ease-out transform ${
                animateIn ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center">
                <div className="w-8 text-center font-bold text-lg text-zinc-500">
                  {index + 1}
                </div>
                
                <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-700 flex-shrink-0 flex items-center justify-center mr-3">
                  {donator.avatar_url ? (
                    <Image
                      src={donator.avatar_url}
                      alt={donator.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-zinc-500 text-xl font-medium">
                      {donator.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                <span className="font-medium text-white truncate max-w-[120px]">
                  {donator.name}
                </span>
              </div>
              
              <span className="font-bold text-green-400">
                ${donator.amount.toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <div className="text-left w-full py-4 text-zinc-400">
            No donors yet or private donors.<br/> Be the first!
          </div>
        )}
      </div>
    </div>
  );
}