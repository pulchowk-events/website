import { Geist, Geist_Mono } from 'next/font/google';

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
});

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${geist.variable} ${geistMono.variable}`} style={{ display: 'contents' }}>
      {children}
    </div>
  );
}
