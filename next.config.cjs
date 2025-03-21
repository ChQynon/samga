/** @type {import('next').NextConfig} */
const nextConfig = {
  // Обязательно отключаем статический экспорт
  output: "standalone",
  eslint: {
    // Отключаем проверку ESLint во время сборки
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Отключаем проверку TypeScript во время сборки
    ignoreBuildErrors: true,
  },
  // Устанавливаем короткий тайм-аут для генерации страниц
  staticPageGenerationTimeout: 30,
  // Конфигурация для совместимости с framer-motion
  experimental: {
    serverComponentsExternalPackages: ['framer-motion'],
    // Отключаем статический рендеринг для решения проблем с framer-motion
    isrMemoryCacheSize: 0,
    esmExternals: 'loose'
  },
  // Отключаем генерацию многих резервных страниц
  generateEtags: false,
  // Необходимо для правильной работы с framer-motion
  compiler: {
    // Отключаем предупреждения о removeConsole
    removeConsole: false
  }
};

module.exports = nextConfig;
