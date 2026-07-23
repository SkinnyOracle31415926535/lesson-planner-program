import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The iPad opens this local preview through the Mac's LAN address. Next's
  // development client otherwise blocks that origin from its live resources,
  // which can leave the page rendered but not interactive.
  allowedDevOrigins: ["10.0.0.177", "10.0.0.175", "localhost", "127.0.0.1"],
};

export default nextConfig;
