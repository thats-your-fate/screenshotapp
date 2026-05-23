import type { NextConfig } from "next";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require("./scripts/load-external-env.cjs").loadExternalEnv();

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
