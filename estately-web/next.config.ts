import path from 'path';
import { config as loadEnv } from 'dotenv';
import type { NextConfig } from "next";

loadEnv({ path: path.resolve(__dirname, '../.env'), quiet: true });
loadEnv({ path: path.resolve(__dirname, '../.env.local'), quiet: true, override: false });

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
};

export default nextConfig;
