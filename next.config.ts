import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: [
    '**.adya.ai',
    '**.localhost',
    '**.local',
    '**.ngrok.io',
    '**.ngrok-free.app',
    '**.vercel.app',
  ],
};

export default nextConfig;
