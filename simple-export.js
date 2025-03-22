#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Начинаю экспорт статической версии приложения...');

// Устанавливаем переменную окружения
process.env.BUILD_TYPE = 'static';

try {
  // Шаг 1: Сборка Next.js с BUILD_TYPE=static
  console.log('📦 Выполняется сборка с BUILD_TYPE=static...');
  execSync('npx cross-env BUILD_TYPE=static next build', { 
    stdio: 'inherit',
    env: { ...process.env, BUILD_TYPE: 'static' }
  });
  
  // Шаг 2: Создаем директорию out если её нет
  if (!fs.existsSync('./out')) {
    console.log('📁 Создание директории out...');
    fs.mkdirSync('./out', { recursive: true });
  }
  
  // Шаг 3: Пробуем запустить next export
  console.log('📤 Выполняется next export...');
  try {
    execSync('npx next export', { 
      stdio: 'inherit',
      env: { ...process.env, BUILD_TYPE: 'static' }
    });
  } catch (exportError) {
    console.warn('⚠️ Стандартный экспорт не удался. Выполняется ручное копирование файлов...');
    
    // Шаг 4: Копирование файлов вручную, если next export не удался
    copyStaticFiles();
  }
  
  // Проверяем результат
  if (fs.existsSync('./out') && fs.readdirSync('./out').length > 0) {
    console.log('✅ Статический экспорт успешно создан в директории ./out');
    
    // Копируем файл app.webmanifest если он существует
    if (fs.existsSync('./public/app.webmanifest')) {
      fs.copyFileSync('./public/app.webmanifest', './out/app.webmanifest');
    }
    
    // Проверяем и копируем public директорию
    if (fs.existsSync('./public')) {
      copyDirectory('./public', './out');
    }
  } else {
    console.error('❌ Не удалось создать статический экспорт!');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Ошибка при экспорте:', error.message);
  process.exit(1);
}

/**
 * Копирует файлы из .next в out вручную
 */
function copyStaticFiles() {
  console.log('📋 Выполняется ручное копирование файлов из .next...');
  
  // Копируем статические файлы
  if (fs.existsSync('./.next/static')) {
    if (!fs.existsSync('./out/_next')) {
      fs.mkdirSync('./out/_next', { recursive: true });
    }
    copyDirectory('./.next/static', './out/_next/static');
  }
  
  // Копируем HTML-файлы
  if (fs.existsSync('./.next/server/pages')) {
    const pages = walkSync('./.next/server/pages');
    
    for (const page of pages) {
      if (page.endsWith('.html')) {
        const relativePath = path.relative('./.next/server/pages', page);
        const destPath = path.join('./out', relativePath);
        
        // Создаем директорию назначения
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        // Копируем HTML файл
        fs.copyFileSync(page, destPath);
      }
    }
  }
  
  // Создаем базовый index.html если его нет
  if (!fs.existsSync('./out/index.html')) {
    createBasicHTML('./out/index.html');
  }
}

/**
 * Создает базовый HTML файл
 */
function createBasicHTML(filePath) {
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>SAMGA</title>
</head>
<body>
  <div id="__next"></div>
  <script src="/_next/static/chunks/main.js" defer></script>
</body>
</html>`;
  
  fs.writeFileSync(filePath, htmlContent);
}

/**
 * Копирует директорию рекурсивно
 */
function copyDirectory(source, destination) {
  // Пропускаем если исходной директории не существует
  if (!fs.existsSync(source)) return;
  
  // Создаем директорию назначения
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
  
  // Копируем содержимое
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);
    
    if (entry.isDirectory()) {
      // Рекурсивно копируем директорию
      copyDirectory(sourcePath, destPath);
    } else {
      // Копируем файл
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

/**
 * Рекурсивно обходит директорию и возвращает список файлов
 */
function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    
    if (stat.isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else {
      filelist.push(filepath);
    }
  }
  
  return filelist;
} 