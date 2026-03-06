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

     

    // Имитируем задержку отправки
    await new Promise((resolve) => setTimeout(resolve, 500))

    return true
  } catch (error) {
    console.error('[email] Ошибка при отправке email:', error)
    return false
  }
}

 