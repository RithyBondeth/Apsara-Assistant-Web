import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The local preview is opened at 127.0.0.1:8888 in Codex. Allow that
  // origin so Next can serve the client chunks that hydrate the carousel.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
