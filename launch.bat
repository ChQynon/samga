@echo off
echo Запуск проекта SAMGA...
echo.

REM Проверка установки Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ОШИБКА] Node.js не установлен. Пожалуйста, установите Node.js с сайта https://nodejs.org/
    echo.
    pause
    exit /b
)

REM Проверка установки npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ОШИБКА] NPM не установлен. Пожалуйста, переустановите Node.js с сайта https://nodejs.org/
    echo.
    pause
    exit /b
)

REM Установка зависимостей, если node_modules не существует
if not exist node_modules (
    echo Устанавливаем зависимости проекта...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ОШИБКА] Не удалось установить зависимости.
        pause
        exit /b
    )
)

REM Копирование .env файла, если он не существует
if not exist .env (
    if exist .env.example (
        copy .env.example .env
        echo Создан файл .env из шаблона .env.example
    )
)

REM Запуск сервера разработки
echo Запускаем сервер разработки...
echo Приложение будет доступно по адресу: http://localhost:3000
echo.
echo Нажмите Ctrl+C для остановки сервера
call npm run dev

pause 