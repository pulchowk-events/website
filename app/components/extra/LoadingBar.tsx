'use client';

import { useEffect } from 'react';
import NProgress from 'nprogress';
import { usePathname } from 'next/navigation';

NProgress.configure({
  showSpinner: false,
  easing: 'ease',
  speed: 500,
  minimum: 0.1,
  trickleSpeed: 200,
});

export default function LoadingBar() {
  const pathname = usePathname();

  
  useEffect(() => {
    // Start the progress bar
    NProgress.start();
    
    // Complete the progress bar when the route fully changes
    const timeoutId = setTimeout(() => {
      NProgress.done();
    }, 500); // Adjust timing as needed
    
    return () => {
      clearTimeout(timeoutId);
      NProgress.done();
    };
  }, [pathname]);
  
  return null; // This component doesn't render anything visible
}