import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // All reader pages are prerendered at build time; the raw data never needs to ship with a function.
  outputFileTracingExcludes: { "/read/**": ["./data/**", "./public/gita/**"] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
