import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.0.41", "192.168.10.90", 'markus-megathermic-revocably.ngrok-free.dev'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://192.168.10.90:5000/:path*'
      },
      {
        source: '/socket.io',
        destination: 'http://192.168.10.90:5000/socket.io/'
      },
      {
        source: '/socket.io/:path*',
        destination: 'http://192.168.10.90:5000/socket.io/:path*'
      }
    ];
  }
};

export default nextConfig;
