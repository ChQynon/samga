# Инструкция по сборке мобильных приложений SAMGA для iOS и Android

Данный документ содержит пошаговую инструкцию по сборке мобильных приложений для iOS и Android из существующего веб-приложения SAMGA с использованием Capacitor.

## Предварительные требования

Для сборки мобильных приложений вам потребуется:

### Общие требования:
- Node.js (версия 18+)
- npm или yarn
- Capacitor CLI

### Для Android:
- Android Studio
- JDK 11 или новее
- Android SDK

### Для iOS:
- macOS
- Xcode 13 или новее
- CocoaPods
- Учетная запись разработчика Apple (для публикации в App Store)

## Шаг 1: Подготовка проекта

1. Убедитесь, что у вас установлены все необходимые зависимости:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios capacitor-nfc
```

2. Создайте статическую сборку приложения:

```bash
npm run build:static
```

## Шаг 2: Инициализация Capacitor

1. Инициализируйте проект Capacitor (если это не было сделано ранее):

```bash
npx cap init SAMGA kz.samga.app
```

2. Добавьте платформы Android и iOS:

```bash
npx cap add android
npx cap add ios
```

## Шаг 3: Синхронизация веб-приложения с нативными проектами

```bash
npx cap sync
```

## Шаг 4: Сборка Android-приложения (APK)

1. Откройте проект Android в Android Studio:

```bash
npx cap open android
```

2. В Android Studio:
   - Подождите завершения синхронизации Gradle
   - Выберите меню Build -> Build Bundle(s) / APK(s) -> Build APK(s)
   - APK-файл будет создан в `android/app/build/outputs/apk/debug/app-debug.apk`

3. Альтернативно, вы можете собрать APK через командную строку:

```bash
cd android
./gradlew assembleDebug
```

## Шаг 5: Сборка iOS-приложения (IPA)

> **Важно**: Для сборки iOS-приложения требуется компьютер с macOS и установленным Xcode.

1. Откройте проект iOS в Xcode:

```bash
npx cap open ios
```

2. В Xcode:
   - Подключите ваше устройство iOS или выберите симулятор
   - Установите Bundle ID и команду разработки в настройках проекта
   - Выберите меню Product -> Archive для создания архива
   - Используйте Window -> Organizer для экспорта IPA-файла

## Шаг 6: Настройка NFC для iOS и Android

### Android

1. Добавьте разрешения NFC в файл `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="true" />
```

### iOS

1. Настройте NFC в Xcode:
   - Откройте проект iOS в Xcode
   - Выберите ваш проект в навигаторе проектов
   - Перейдите на вкладку "Signing & Capabilities"
   - Нажмите "+" и добавьте возможность "Near Field Communication Tag Reading"
   - Добавьте Background Mode с опцией "Tag reading"

2. Настройте Info.plist (добавьте следующие строки):

```xml
<key>NFCReaderUsageDescription</key>
<string>Приложение SAMGA использует NFC для авторизации устройств и быстрого входа в систему.</string>
<key>com.apple.developer.nfc.readersession.formats</key>
<array>
    <string>NDEF</string>
</array>
```

## Публикация приложений

### Android

Для публикации в Google Play Store вам необходимо:
1. Создать подписанный APK с помощью ключа keystore
2. Создать учетную запись разработчика в Google Play Console
3. Следовать инструкциям по загрузке и публикации приложения

### iOS

Для публикации в App Store вам необходимо:
1. Создать сертификаты распространения в Apple Developer Portal
2. Создать профиль распространения
3. Архивировать и валидировать приложение через Xcode
4. Отправить приложение на рассмотрение через App Store Connect

## Автоматизация сборки

Для автоматизации сборки вы можете использовать скрипты из package.json:

```bash
# Для Android
npm run capacitor:build:android

# Для iOS
npm run capacitor:build:ios
```

## Устранение проблем

### Проблемы с NFC на iOS
- Убедитесь, что добавлены все необходимые ключи в Info.plist
- Проверьте, что у вас есть сертификат разработчика Apple
- NFC на iOS работает только на iPhone 7 и новее с iOS 13+

### Проблемы с NFC на Android
- Убедитесь, что в Android Manifest добавлены все необходимые разрешения
- Проверьте, что устройство имеет аппаратную поддержку NFC
- Убедитесь, что NFC включен в настройках устройства

## Дополнительная информация

- [Документация Capacitor](https://capacitorjs.com/docs)
- [Полезная информация по NFC в iOS](https://developer.apple.com/documentation/corenfc)
- [Документация по NFC в Android](https://developer.android.com/guide/topics/connectivity/nfc) 