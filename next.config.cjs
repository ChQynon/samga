/** @type {import('next').NextConfig} */
const nextConfig = {
  // Отключаем статический экспорт, переключаемся на SSR
  // output: "export",
  eslint: {
    // Отключаем проверку ESLint во время сборки
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Отключаем проверку TypeScript во время сборки
    ignoreBuildErrors: true,
  },
  // Добавляем экспериментальную опцию для совместимости с framer-motion
  experimental: {
    serverComponentsExternalPackages: ['framer-motion'],
  }
};

module.exports = nextConfig;
