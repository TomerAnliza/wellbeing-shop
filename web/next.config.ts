import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // תמונות המוצרים יושבות ב-bucket ציבורי ב-Supabase Storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "owvvkwxzjuglrfeuujez.supabase.co",
        pathname: "/storage/v1/object/public/products/**",
      },
    ],
  },
};

export default nextConfig;
