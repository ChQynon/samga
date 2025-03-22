/** @type {import('next').NextConfig} */
const nextConfig = {
  // Отключаем строгую проверку типов и линтинг при сборке
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // Необходимо для корректной работы с Capacitor
  output: 'export',
  // Обходим ограничения с изображениями для статического экспорта
  images: {
    unoptimized: true
  },
  // Отключаем строгий режим для устранения предупреждений React
  reactStrictMode: false,
  // Опции экспериментальных функций
  experimental: {
    webpackBuildWorker: true
  }
};

export default nextConfig; 