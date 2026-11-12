import type { Metadata } from 'next';
import LandingRoot from '@/app/components/landing/LandingRoot';
import './landing.css';

export const metadata: Metadata = {
  title: "Pulchowk Events — Never miss what's on at campus",
  description: 'Events, jobs, and scholarships from all over Nepal, together in one place.',
};

export default function LandingPage() {
  return <LandingRoot />;
}
