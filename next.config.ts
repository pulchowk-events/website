import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'anzrkakfmuohsyootolj.supabase.co',
      'cdn.discordapp.com',
      'lh3.googleusercontent.com',
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      { source: '/about', destination: '/faq', permanent: true },
    ];
  },
};

export default nextConfig;
