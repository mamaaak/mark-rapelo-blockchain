import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Optimize for production
  swcMinify: true,
  
  // Performance optimizations
  compress: true,
};

export default nextConfig;
