#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Подготовка к деплою на Vercel...');

// Проверка на наличие Vercel CLI
try {
  execSync('vercel --version', { stdio: 'pipe' });
} catch (error) {
  console.log('📦 Установка Vercel CLI...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
  } catch (installError) {
    console.error('❌ Ошибка при установке Vercel CLI:', 
      installError instanceof Error ? installError.message : String(installError));
    process.exit(1);
  }
}

// Исправление ошибок TypeScript
console.log('🔧 Исправление ошибок TypeScript...');
try {
  execSync('node fix-ts-errors.js', { stdio: 'inherit' });
} catch (error) {
  console.warn('⚠️ Не удалось автоматически исправить все ошибки TypeScript. Продолжаем...');
}

// Проверка наличия .vercelignore
if (!fs.existsSync('.vercelignore')) {
  console.log('📄 Создание .vercelignore файла...');
  const ignoreContent = `# Мобильные платформы
/android/
/ios/
/node_modules/
/npm-debug.log
/out/
/MOBILE_APP_README.md
init-mobile-apps.js
capacitor.config.ts
android.keystore
.github/
.vscode/`;
  
  fs.writeFileSync('.vercelignore', ignoreContent);
}

// Запуск деплоя
console.log('🔄 Запуск деплоя на Vercel...');

// Запускаем сборку для веб-приложения
console.log('📦 Создание веб-сборки...');
try {
  execSync('npm run build:web', { stdio: 'inherit' });
} catch (buildError) {
  console.error('❌ Ошибка при создании веб-сборки:', 
    buildError instanceof Error ? buildError.message : String(buildError));
  process.exit(1);
}

try {
  execSync('vercel --prod', { stdio: 'inherit' });
  console.log('✅ Деплой успешно завершен!');
} catch (error) {
  console.error('❌ Ошибка при деплое:', 
    error instanceof Error ? error.message : String(error));
  process.exit(1);
} 