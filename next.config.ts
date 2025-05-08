import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true, // Helps with React warnings
  images: {
    domains: ['anzrkakfmuohsyootolj.supabase.co', 'cdn.discordapp.com'], // Add your image domains here
  },
};

export default nextConfig;
