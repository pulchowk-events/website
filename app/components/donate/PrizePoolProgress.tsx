'use client';

import { useState, useEffect } from 'react';
import { Users, Award } from 'lucide-react';
import DonateButton from './DonateButton';

interface PrizePoolProgressProps {
  currentAmount: number;
  targetAmount: number;
  totalDonors: number;
}

export default function PrizePoolProgress({ 
  currentAmount, 
  targetAmount, 
  totalDonors 
}: PrizePoolProgressProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  
  // Calculate progress percentage
  const progressPercentage = Math.min(100, (currentAmount / targetAmount) * 100);
  
  useEffect(() => {
    // Animate progress bar on mount or when values change
    const timer = setTimeout(() => {
      setAnimatedWidth(progressPercentage);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  return (
    <div className="bg-zinc-800/50 rounded-lg shadow-lg border border-zinc-800 p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            Investment Prize Pool
          </h2>
          <p className="text-zinc-400 mt-1">Help fund the next generation of developers, entreprenuers & researchers — funds go to the top 3 products. </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <DonateButton 
            variant="default"
            className="shadow-green-600/20 hover:shadow-green-600/30 hover:scale-102 hover:cursor-pointer"
            showIcon={false}
            text="Support the Cause"
          />
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5">
        <div className="flex items-center mb-3 md:mb-0">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white">${currentAmount.toLocaleString()}</span>
            <span className="text-zinc-400 text-sm">raised of ${targetAmount.toLocaleString()} goal</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-400" />
          <div>
            <span className="text-white font-medium">{totalDonors}</span>
            <span className="text-zinc-400 ml-1">donors</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-4 bg-zinc-700 rounded-full overflow-hidden">
        <div 
          className="absolute h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${animatedWidth}%` }}
        />
      </div>
    </div>
  );
}