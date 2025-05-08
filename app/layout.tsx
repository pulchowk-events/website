import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'


const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: "Pulchowk Events",
  description: "A platform for Nation Wide Campus events & products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className={`${inter.className}  bg-charcoal text-green-100`}>

        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
