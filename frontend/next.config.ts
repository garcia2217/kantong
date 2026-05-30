import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    allowedDevOrigins: ["192.168.0.124"],

    // Proxy /api/* to the backend so the browser only ever sees the frontend
    // origin. This makes the auth cookie first-party, sidestepping third-party
    // cookie blocking (Safari ITP, incognito, mobile Chrome). See
    // docs/MOBILE_AUTH_FIX.md.
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${process.env.BACKEND_INTERNAL_URL}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
