import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos de perfil de GitHub: desde que el login es OAuth real, `avatarUrl`
    // apunta acá. Sin este permiso next/image lanza en runtime.
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
