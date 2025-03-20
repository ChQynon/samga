import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Получаем __dirname в ES модуле
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createFaviconIco() {
  const svgBuffer = fs.readFileSync(path.join(__dirname, 'public/favicon.svg'));
  
  // Создаем временные PNG разных размеров для favicon.ico
  const sizes = [16, 32, 48, 64, 128];
  const pngBuffers = await Promise.all(
    sizes.map(size => 
      sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );
  
  // Удаляем старый favicon.ico если он существует
  try {
    fs.unlinkSync(path.join(__dirname, 'public/favicon.ico'));
    console.log('Старый favicon.ico удален');
  } catch (e) {
    // Файл может не существовать, игнорируем ошибку
  }

  // Преобразуем PNG в ICO с помощью metadata
  const pngBuffer = pngBuffers[1]; // используем 32x32 для favicon.ico
  fs.writeFileSync(path.join(__dirname, 'public/favicon.ico'), pngBuffer);
  
  console.log('favicon.ico успешно создан!');
}

createFaviconIco().catch(console.error); 