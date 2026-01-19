/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Optimize for static export (Netlify)
  output: 'export',
  trailingSlash: true,
};

module.exports = nextConfig;
