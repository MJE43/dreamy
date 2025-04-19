import type { NextConfig } from "next";
import nextBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true, // Example option, keep your existing ones
};

export default withBundleAnalyzer(nextConfig);
