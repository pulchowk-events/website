import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true, // Helps with React warnings
  images: {
    domains: ['anzrkakfmuohsyootolj.supabase.co'], // Add your image domains here
  },
};

export default nextConfig;
