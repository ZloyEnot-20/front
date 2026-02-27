// Email service - имитирует отправку письма
export interface EmailData {
  to: string
  subject: string
  firstName: string
  lastName: string
  exhibitionTitle: string
  city: string
  qrCodeUrl: string
  registrationId: string
}

export async function sendRegistrationEmail(data: EmailData): Promise<boolean> {
  try {
    // В реальном приложении здесь был бы запрос к сервису отправки почты (SendGrid, Mailgun и т.д.)
    // Сейчас имитируем успешную отправку
    
    const emailBody = `
      Уважаемый(ая) ${data.firstName} ${data.lastName}!

      Спасибо за регистрацию на выставку "${data.exhibitionTitle}".

      Детали регистрации:
      - Город проведения: ${data.city}
      - ID регистрации: ${data.registrationId}
      - Дата: ${new Date().toLocaleDateString('ru-RU')}

      QR-код вложен к письму. Предъявите его на входе на выставку.

      С уважением,
      Команда EDU Expo
    `

    console.log('[v0] Email отправлен:')
    console.log(`To: ${data.to}`)
    console.log(`Subject: ${data.subject}`)
    console.log(`Body: ${emailBody}`)

    // Имитируем задержку отправки
    await new Promise((resolve) => setTimeout(resolve, 500))

    return true
  } catch (error) {
    console.error('[v0] Ошибка при отправке email:', error)
    return false
  }
}

export async function sendBitrixIntegration(data: {
  firstName: string
  lastName: string
  email: string
  phone: string
  exhibitionId: string
  city: string
}): Promise<boolean> {
  try {
    // В реальном приложении здесь был бы запрос к Bitrix24 API
    // Сейчас имитируем успешную интеграцию
    
    console.log('[v0] Отправка данных в Bitrix24:')
    console.log(JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
    }, null, 2))

    // Имитируем задержку интеграции
    await new Promise((resolve) => setTimeout(resolve, 800))

    return true
  } catch (error) {
    console.error('[v0] Ошибка при интеграции с Bitrix24:', error)
    return false
  }
}
