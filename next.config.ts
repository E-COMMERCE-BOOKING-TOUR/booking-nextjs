import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  generateBuildId: async () => {
    // This ensures that the build ID is consistent across multiple containers
    // in a single deployment. In a CI/CD pipeline, this could be a git commit hash.
    return process.env.BUILD_ID || 'stable-build-id';
  },
  experimental: {
    optimizePackageImports: ["@chakra-ui/react", "lucide-react", "react-icons", "date-fns"]
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);

