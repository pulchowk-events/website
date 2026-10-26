import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';
import LoadingBar from '@/app/components/extra/LoadingBar';
import GlobalLoader from '@/app/components/extra/GlobalLoader';
import FetchInterceptor from '@/app/components/extra/FetchInterceptor';
import NavigationLoader from '@/app/components/extra/NavigationLoader';
import { ColdStartNotice } from '@/app/components/extra/ColdStartNotice';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pulchowk Events',
  description: 'A platform for Nation Wide Campus events & products.',
  icons: { icon: '/logo.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NavigationLoader />
        <FetchInterceptor />
        <GlobalLoader />
        <LoadingBar />
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
        <ColdStartNotice />
      </body>
    </html>
  );
}