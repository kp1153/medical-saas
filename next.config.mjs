const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "medical-saas-32pt.vercel.app",
          },
        ],
        destination: "https://clinic.nishantsoftwares.in/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;