/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Включаем статический экспорт
  eslint: {
    // Отключаем проверку ESLint во время сборки
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Отключаем проверку TypeScript во время сборки
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
