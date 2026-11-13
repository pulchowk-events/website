import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    domains: [
      "anzrkakfmuohsyootolj.supabase.co",
      "cdn.discordapp.com",
      "lh3.googleusercontent.com",
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      { source: "/about", destination: "/help", permanent: true },
      { source: "/faq", destination: "/help", permanent: true },
      // Old /jobs/role/<tech> URLs from before the role list was curated.
      // These were never roles — technologies now live under /jobs/skills.
      { source: "/jobs/role/react", destination: "/jobs/skills/react", permanent: true },
      { source: "/jobs/role/node-js", destination: "/jobs/skills/node-js", permanent: true },
      { source: "/jobs/role/python", destination: "/jobs/skills/python", permanent: true },
      { source: "/jobs/role/java", destination: "/jobs/skills/java", permanent: true },
      { source: "/jobs/role/php", destination: "/jobs/skills/php", permanent: true },
      { source: "/jobs/role/flutter", destination: "/jobs/skills/flutter", permanent: true },
      { source: "/jobs/role/android", destination: "/jobs?q=android", permanent: true },
      { source: "/jobs/role/ios", destination: "/jobs?q=ios", permanent: true },
    ];
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
