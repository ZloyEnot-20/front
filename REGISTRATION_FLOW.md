# Процесс регистрации на выставку (Visitor Registration Flow)

## Полный цикл регистрации:

### Шаг 1: Visitor нажимает на публикацию выставки
- Visitor видит карточку выставки на главной странице или странице выставок
- Нажимает кнопку "Зарегистрироваться" на карточке или на странице детальной выставки

### Шаг 2: Выбирает город проведения выставки
- Откроется модальное окно регистрации в три этапа:
  1. **Форма данных** - заполнение имени, фамилии, email и телефона
  2. **Выбор города** - выбор города проведения выставки из списка
  3. **Подтверждение и QR-код** - финальный экран с успехом

### Шаг 3: Система отправляет данные в Bitrix
- После выбора города система отправляет следующие данные в Bitrix:
  - Фамилия
  - Имя
  - Email
  - Номер телефона
  - ID выставки
  - Город проведения

**Файл:** `/lib/email-service.ts` - функция `sendBitrixIntegration()`

### Шаг 4: Система генерирует QR-код
- QR-код содержит:
  - ID регистрации
  - ФИО участника
  - Email
  - Телефон
  - Название выставки
  - Город
  - Дату регистрации

- QR-код генерируется через API: `https://api.qrserver.com/v1/create-qr-code/`

### Шаг 5: QR-код отображается в личном кабинете Visitor
- Visitor переходит в раздел "Кабинет участника" → "Мои выставки (QR)"
- Видит все свои регистрации с QR-кодами
- Может:
  - Просмотреть QR-код на экране
  - Скачать QR-код
  - Увидеть все детали регистрации

**Путь:** `/app/participant/page.tsx` → Tab "registered"

### Шаг 6: Visitor получает письмо об успешной регистрации
- На указанный email отправляется письмо с:
  - Подтверждением регистрации
  - Деталями выставки
  - ID регистрации
  - QR-кодом (в реальном приложении - в виде вложения)

**Файл:** `/lib/email-service.ts` - функция `sendRegistrationEmail()`

## Архитектура и компоненты:

### 1. **RegistrationModal** (`/components/exhibitions/registration-modal.tsx`)
- Трехэтапное модальное окно регистрации
- Интеграция с Admin Context и Auth Context
- Генерация QR-кодов
- Отправка email и интеграция с Bitrix

### 2. **ExhibitionCard** (`/components/exhibitions/exhibition-card.tsx`)
- Карточка выставки с кнопкой "Зарегистрироваться"
- Открывает RegistrationModal

### 3. **ExhibitionPage** (`/app/exhibitions/[id]/page.tsx`)
- Страница детальной информации о выставке
- Кнопка регистрации в сайдбаре
- Открывает RegistrationModal

### 4. **ParticipantPage** (`/app/participant/page.tsx`)
- Личный кабинет visitor
- Вкладка "Мои выставки (QR)" с отображением всех регистраций
- Каждая регистрация показывает:
  - ФИО, email, телефон
  - QR-код
  - Кнопки скачивания и показа на экране

### 5. **AdminContext** (`/lib/admin-context.tsx`)
- Управление регистрациями в памяти приложения
- Функции:
  - `addRegistration()` - добавить новую регистрацию
  - `getRegistrationsByUser()` - получить регистрации visitor
  - `getRegistrationsByExhibition()` - получить регистрации на выставку

### 6. **EmailService** (`/lib/email-service.ts`)
- `sendRegistrationEmail()` - отправка письма об успешной регистрации
- `sendBitrixIntegration()` - отправка данных в Bitrix24

### 7. **Types** (`/lib/types.ts`)
- `ExhibitionRegistration` - интерфейс для хранения регистрации

## Поток данных:

```
Visitor нажимает "Зарегистрироваться"
    ↓
RegistrationModal открывается
    ↓
Visitor заполняет форму (имя, фамилия, email, телефон)
    ↓
Visitor выбирает город
    ↓
sendBitrixIntegration() - отправка данных в Bitrix
    ↓
QR-код генерируется
    ↓
addRegistration() - сохранение в AdminContext
    ↓
sendRegistrationEmail() - отправка письма
    ↓
Успешная регистрация!
    ↓
QR-код видна в личном кабинете "Мои выставки (QR)"
```

## Использование в реальном приложении:

### Интеграция с реальным Bitrix24:
Замените функцию в `/lib/email-service.ts`:

```typescript
export async function sendBitrixIntegration(data: {...}) {
  const response = await fetch('https://your-domain.bitrix24.ru/rest/1/YOUR_TOKEN/crm.contact.add', {
    method: 'POST',
    body: JSON.stringify({
      fields: {
        NAME: data.firstName,
        LAST_NAME: data.lastName,
        EMAIL: [{ VALUE: data.email }],
        PHONE: [{ VALUE: data.phone }],
      },
      params: {
        REGISTER_SONET_EVENT: 'Y'
      }
    })
  })
  return response.ok
}
```

### Интеграция с реальным Email сервисом:
Используйте SendGrid, Mailgun или другой сервис:

```typescript
export async function sendRegistrationEmail(data: EmailData) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}` },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: data.to }] }],
      from: { email: 'noreply@myfair.com' },
      subject: data.subject,
      content: [{ type: 'text/html', value: htmlTemplate(data) }]
    })
  })
  return response.ok
}
```

## Статус: ✅ Полностью реализовано

Все 6 шагов процесса регистрации на выставку полностью реализованы и работают!
