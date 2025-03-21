/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Включаем статический экспорт
  eslint: {
    // Отключаем проверку ESLint во время сборки
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
