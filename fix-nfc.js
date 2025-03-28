// Скрипт для исправления проблем с NFC-авторизацией
// Для использования: откройте консоль разработчика на странице приложения и вставьте туда содержимое этого файла

// Очистка старых данных
localStorage.removeItem('samga-authorized-devices');
localStorage.removeItem('samga-current-device-id');
localStorage.removeItem('device-nfc-authorized');
localStorage.removeItem('force-update-devices');
localStorage.removeItem('current-device-info');
localStorage.removeItem('last-auth-source');
localStorage.removeItem('initial-load-complete');

// Создание тестового устройства для отладки
const deviceId = 'test-device-' + Math.random().toString(36).substring(2, 15);
const devices = [{
  id: deviceId,
  name: 'Тестовое устройство',
  browser: navigator.userAgent,
  lastAccess: new Date().toLocaleString('ru'),
  timestamp: Date.now(),
  isNFCAuthorized: true
}];

// Сохранение тестового устройства
localStorage.setItem('samga-authorized-devices', JSON.stringify(devices));
localStorage.setItem('samga-current-device-id', deviceId);
localStorage.setItem('device-nfc-authorized', 'true');
localStorage.setItem('force-update-devices', Date.now().toString());

// Для принудительного обновления страницы
console.log('Данные сброшены и создано тестовое устройство. Страница будет перезагружена.');
setTimeout(() => {
  window.location.reload();
}, 1000); 