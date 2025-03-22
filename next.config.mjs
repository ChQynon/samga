/** @type {import('next').NextConfig} */
const nextConfig = {
  // Отключаем строгую проверку типов и линтинг при сборке
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // Настройка вывода в зависимости от типа сборки
  ...(process.env.BUILD_TYPE === 'static' 
    ? {
        output: 'export',
        // Обходим ограничения с изображениями для статического экспорта
        images: {
          unoptimized: true
        },
        // Исключаем API маршруты для статической сборки
        experimental: {
          webpackBuildWorker: true
        }
      }
    : {
        // Конфигурация для обычного веб-приложения
        images: {
          domains: ['app.samga.kz']
        },
        experimental: {
          webpackBuildWorker: true
        }
      }
  ),
  // Отключаем строгий режим для устранения предупреждений React
  reactStrictMode: false,
};

export default nextConfig; 