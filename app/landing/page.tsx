import type { Metadata } from 'next';
import LandingRoot from '@/app/components/landing/LandingRoot';
import './landing.css';

export const metadata: Metadata = {
  title: "Pulchowk Events — Never miss what\'s on at campus",
  description: 'Events, jobs, and scholarships from all over Nepal, together in one place.',
  openGraph: {
    title: "Pulchowk Events — Never miss what\'s on at campus",
    description: 'Events, jobs, and scholarships from all over Nepal, together in one place.',
    type: 'website',
    url: '/landing',
    images: [
      {
        url: '/og-landing.png',
        width: 1200,
        height: 630,
        alt: 'Pulchowk Events — Never miss what\'s on at campus',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Pulchowk Events — Never miss what\'s on at campus",
    description: 'Events, jobs, and scholarships from all over Nepal, together in one place.',
    images: ['/og-landing.png'],
  },
};

export default function LandingPage() {
  return <LandingRoot />;
}
