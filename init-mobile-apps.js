import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Скрипт для инициализации мобильных приложений SAMGA
 * Этот скрипт автоматизирует создание мобильных проектов для Android и iOS.
 */

console.log('Инициализация мобильных приложений SAMGA для iOS и Android...');

// Проверка зависимостей
try {
  console.log('Проверка установленных зависимостей...');
  
  // Проверяем наличие Capacitor
  execSync('npx cap --version', { stdio: 'inherit' });
  console.log('✅ Capacitor установлен');
  
  // Проверяем установленные платформы
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const dependencies = {...packageJson.dependencies, ...packageJson.devDependencies};
  
  if (!dependencies['@capacitor/android'] || !dependencies['@capacitor/ios']) {
    console.log('❌ Не найдены зависимости Capacitor для Android/iOS');
    console.log('Установка необходимых зависимостей...');
    execSync('npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios capacitor-nfc', { stdio: 'inherit' });
  } else {
    console.log('✅ Зависимости Capacitor установлены');
  }
} catch (err) {
  const error = err instanceof Error ? err : new Error(String(err));
  console.error('❌ Ошибка при проверке зависимостей:', error.message);
  console.log('Установка необходимых зависимостей...');
  execSync('npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios capacitor-nfc', { stdio: 'inherit' });
}

// Проверка конфигурации Next.js
if (!fs.existsSync('./next.config.mjs')) {
  console.log('❌ Файл next.config.mjs не найден');
  console.log('Создание конфигурации Next.js...');
  
  const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  output: 'export',
  images: {
    unoptimized: true
  },
  reactStrictMode: false
};

export default nextConfig;`;
  
  fs.writeFileSync('./next.config.mjs', nextConfigContent);
  console.log('✅ Файл next.config.mjs создан');
}

// Проверка конфигурации Capacitor
if (!fs.existsSync('./capacitor.config.ts') && !fs.existsSync('./capacitor.config.js')) {
  console.log('❌ Файл конфигурации Capacitor не найден');
  console.log('Создание файла конфигурации...');
  
  const configContent = `import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'kz.samga.app',
  appName: 'SAMGA',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'app.samga.kz'
  },
  plugins: {
    NFC: {
      enabled: true
    }
  }
};

export default config;`;
  
  fs.writeFileSync('./capacitor.config.ts', configContent);
  console.log('✅ Файл конфигурации Capacitor создан');
}

// Создание статического билда
console.log('Сборка статической версии приложения...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  
  // Проверяем, есть ли директория out
  if (!fs.existsSync('./out')) {
    console.error('❌ Директория "out" не найдена после сборки!');
    console.log('Возможно, неправильно настроен Next.js config или скрипт сборки');
    process.exit(1);
  }
  console.log('✅ Статическая сборка создана');
} catch (err) {
  const error = err instanceof Error ? err : new Error(String(err));
  console.error('❌ Ошибка при создании статической сборки:', error.message);
  process.exit(1);
}

// Инициализация платформ
try {
  console.log('Синхронизация веб-билда с нативными проектами...');
  execSync('npx cap sync', { stdio: 'inherit' });
  
  // Проверяем существование директорий Android и iOS
  if (!fs.existsSync('./android')) {
    console.log('Директория Android не найдена. Инициализация Android проекта...');
    execSync('npx cap add android', { stdio: 'inherit' });
  } else {
    console.log('✅ Проект Android уже существует');
  }
  
  if (!fs.existsSync('./ios')) {
    console.log('Директория iOS не найдена. Инициализация iOS проекта...');
    execSync('npx cap add ios', { stdio: 'inherit' });
  } else {
    console.log('✅ Проект iOS уже существует');
  }
  
  // Обновление проектов
  console.log('Обновление нативных проектов...');
  execSync('npx cap sync', { stdio: 'inherit' });
  
  console.log('\n✅ Инициализация завершена успешно!\n');
  console.log('Следующие шаги:');
  console.log('1. Для Android: запустите "npm run capacitor:open:android"');
  console.log('2. Для iOS: запустите "npm run capacitor:open:ios" (требуется macOS)');
  console.log('\nДля сборки APK: npm run capacitor:build:android');
  console.log('Для сборки IPA: npm run capacitor:build:ios');
  console.log('\nПодробная документация: см. файл MOBILE_APP_README.md');
} catch (err) {
  const error = err instanceof Error ? err : new Error(String(err));
  console.error('❌ Ошибка при инициализации платформ:', error.message);
} 