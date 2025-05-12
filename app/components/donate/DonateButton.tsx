'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface DonateButtonProps {
  className?: string;
  variant?: 'default' | 'small' | 'large';
  text?: string;
  showIcon?: boolean;
}

export default function DonateButton({ 
  className = '',
  variant = 'default',
  text = 'Donate Now',
  showIcon = true
}: DonateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Button size variations
  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    default: 'px-6 py-2 text-base',
    large: 'px-8 py-3 text-lg'
  };
  
  const handleDonateClick = () => {
    setIsLoading(true);
    
    // Analytics tracking could be added here
    
    try {
      router.push('/donate');
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDonateClick}
      disabled={isLoading}
      className={`
        bg-green-600 hover:bg-green-700 text-white 
        rounded-lg font-medium flex items-center justify-center
        transition-all shadow-lg disabled:opacity-70
        ${sizeClasses[variant]}
        ${className}
      `}
    >
      {isLoading ? (
        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
      ) : (
        showIcon && <DollarSign className="h-5 w-5 mr-2" />
      )}
      {text}
    </button>
  );
}