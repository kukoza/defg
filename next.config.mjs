/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // ปิดการใช้งาน SSR สำหรับหน้าที่มีปัญหา
  experimental: {
    // ปิดการ prerender หน้าที่มีปัญหา
    excludeDefaultMomentLocales: true,
  },
  // แก้ไขปัญหา case sensitivity
  webpack: (config, { isServer }) => {
    config.resolve.symlinks = false;
    return config;
  },
}

module.exports = nextConfig