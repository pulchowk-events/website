import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { VoteProvider } from '@/app/lib/VoteContext';
import { Toaster } from '@/components/ui/sonner';
import LoadingBar from '@/app/components/extra/LoadingBar';
import GlobalLoader from '@/app/components/extra/GlobalLoader';
import FetchInterceptor from '@/app/components/extra/FetchInterceptor';
import NavigationLoader from '@/app/components/extra/NavigationLoader';
import JsonLd from '@/app/components/seo/JsonLd';
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION } from '@/app/lib/seo';
import Analytics from '@/app/components/analytics';

const geistSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Campus Events & Student Projects in Nepal`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  icons: { icon: '/logo.svg' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    images: [`${SITE_URL}/opengraph-image`],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [`${SITE_URL}/opengraph-image`],
  },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  other: {
    "google-site-verification": "25UmDG5Ym56MuIL1tIA9q9oStDMgmWmJuhv_OTDgAc0",
  },
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  sameAs: ['https://discord.gg/cQ5gxusATk'],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${geistSans.className}`}>
        <JsonLd data={orgJsonLd} />
        <JsonLd data={websiteJsonLd} />
        <NavigationLoader />
        <FetchInterceptor />
        <GlobalLoader />
        <LoadingBar />
        <Providers><VoteProvider>{children}</VoteProvider></Providers>
        <Toaster richColors position="top-right" />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <Analytics measurementId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
