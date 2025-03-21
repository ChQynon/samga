import React from 'react'

export const metadata = {
  title: 'Условия использования | samga.nis',
}

const TermsOfService = () => {
  return (
    <div className="space-y-6 py-4">
      <h1 className="text-2xl font-bold">Условия использования</h1>
      <p className="text-sm text-muted-foreground">Обновлено: Март 2025</p>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">1. Принятие условий</h2>
          <p className="mt-2 text-muted-foreground">
            Используя сайт samga.nis, вы соглашаетесь с данными условиями использования. Если вы не согласны с этими условиями, пожалуйста, не используйте наш сайт.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">2. Изменения условий</h2>
          <p className="mt-2 text-muted-foreground">
            Мы оставляем за собой право в любое время изменять или дополнять настоящие условия. Изменения вступают в силу сразу после публикации обновленных условий на сайте.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">3. Учетные записи пользователей</h2>
          <p className="mt-2 text-muted-foreground">
            Для доступа к некоторым функциям сайта вам необходимо создать учетную запись. Вы несете ответственность за сохранение конфиденциальности вашей учетной записи и пароля.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">4. Правила поведения</h2>
          <p className="mt-2 text-muted-foreground">
            Используя наш сайт, вы соглашаетесь не нарушать законы, не распространять вредоносное программное обеспечение и не препятствовать работе сайта.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">5. Интеллектуальная собственность</h2>
          <p className="mt-2 text-muted-foreground">
            Весь контент на нашем сайте, включая тексты, изображения, логотипы и программный код, защищен авторским правом и является нашей собственностью или собственностью наших партнеров.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">6. Ограничение ответственности</h2>
          <p className="mt-2 text-muted-foreground">
            Мы не несем ответственности за любые прямые, косвенные, случайные или последующие убытки, возникшие в результате использования или невозможности использования нашего сайта.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">7. Ссылки на другие сайты</h2>
          <p className="mt-2 text-muted-foreground">
            Наш сайт может содержать ссылки на другие сайты. Мы не несем ответственности за содержание, правила конфиденциальности или практики любых сторонних сайтов.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">8. Прекращение доступа</h2>
          <p className="mt-2 text-muted-foreground">
            Мы оставляем за собой право прекратить или ограничить ваш доступ к нашему сайту в любое время без предварительного уведомления по любой причине.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">9. Применимое право</h2>
          <p className="mt-2 text-muted-foreground">
            Настоящие условия регулируются и толкуются в соответствии с законодательством Казахстана, без учета принципов коллизионного права.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">10. Контактная информация</h2>
          <p className="mt-2 text-muted-foreground">
            Если у вас есть вопросы по поводу этих условий, пожалуйста, свяжитесь с нами через <a href="https://t.me/samgay_nis" className="text-blue-500 hover:underline">наш Telegram канал</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">11. Образовательные данные</h2>
          <p className="mt-2 text-muted-foreground">
            Данные об успеваемости, предоставляемые на сайте, являются информативными и могут использоваться только в образовательных целях.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TermsOfService 