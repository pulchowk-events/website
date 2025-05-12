import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true, // Helps with React warnings
  images: {
    domains: ['anzrkakfmuohsyootolj.supabase.co', 'cdn.discordapp.com', 'lh3.googleusercontent.com'], // Add your image domains here
  },
  typescript: {
    ignoreBuildErrors: true, // This will suppress TypeScript errors during build
  },
};

export default nextConfig;