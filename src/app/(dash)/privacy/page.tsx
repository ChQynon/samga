import React from 'react'

export const metadata = {
  title: 'Политика конфиденциальности | samga.nis',
}

const PrivacyPolicy = () => {
  return (
    <div className="space-y-6 py-4">
      <h1 className="text-2xl font-bold">Политика конфиденциальности</h1>
      <p className="text-sm text-muted-foreground">Обновлено: Март 2025</p>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">1. Общие положения</h2>
          <p className="mt-2 text-muted-foreground">
            Данная политика конфиденциальности описывает, как samga.nis собирает, использует и защищает вашу личную информацию при использовании нашего сайта и услуг.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">2. Сбор информации</h2>
          <p className="mt-2 text-muted-foreground">
            Мы собираем информацию, которую вы предоставляете при регистрации, а также информацию об использовании сайта, включая IP-адрес, тип браузера и устройства.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">3. Использование информации</h2>
          <p className="mt-2 text-muted-foreground">
            Мы используем вашу информацию для предоставления персонализированных образовательных услуг, улучшения нашего сайта и для связи с вами.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">4. Хранение данных</h2>
          <p className="mt-2 text-muted-foreground">
            Ваши данные хранятся на защищенных серверах и удаляются, когда они больше не нужны для целей, для которых они собирались.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">5. Защита информации</h2>
          <p className="mt-2 text-muted-foreground">
            Мы принимаем соответствующие меры для защиты вашей информации от несанкционированного доступа, раскрытия, изменения или уничтожения.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">6. Cookies</h2>
          <p className="mt-2 text-muted-foreground">
            Мы используем cookies для улучшения вашего опыта использования сайта. Вы можете настроить свой браузер, чтобы отклонять cookies, но это может повлиять на функциональность сайта.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">7. Передача данных третьим лицам</h2>
          <p className="mt-2 text-muted-foreground">
            Мы не продаем, не передаем и не разглашаем вашу личную информацию третьим лицам без вашего согласия, за исключением случаев, предусмотренных законом.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">8. Права пользователей</h2>
          <p className="mt-2 text-muted-foreground">
            Вы имеете право запросить доступ к вашей личной информации, которую мы храним, а также запросить ее исправление или удаление.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">9. Изменения в политике конфиденциальности</h2>
          <p className="mt-2 text-muted-foreground">
            Мы можем обновлять нашу политику конфиденциальности. Мы уведомим вас о любых существенных изменениях путем размещения новой политики на этой странице.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">10. Контактная информация</h2>
          <p className="mt-2 text-muted-foreground">
            Если у вас есть вопросы о нашей политике конфиденциальности, пожалуйста, свяжитесь с нами через <a href="https://t.me/samgay_nis" className="text-blue-500 hover:underline">наш Telegram канал</a>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy 