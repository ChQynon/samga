import { isStaticExport } from '../staticExport';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'API работает' });
}

export async function POST() {
  return NextResponse.json({ message: 'API работает' });
}

// Предотвращаем включение этого роута в статическую сборку
export function generateStaticParams() {
  if (isStaticExport()) {
    return [];
  }
  // Для деплоя на Vercel этот роут будет доступен
  return null;
} 