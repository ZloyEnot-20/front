# Архитектура платформы Myfair

## Системная архитектура

```
┌─────────────────────────────────────────────────────────────────┐
│                    MYFAIR PLATFORM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   Visitor/User   │  │  Exhibitor/Staff │  │   Admin      │  │
│  │   (Public Role)  │  │   (Business Role)│  │  (Manager)   │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
│           │                     │                    │          │
│           └─────────────────────┼────────────────────┘          │
│                                 │                               │
│                        ┌────────▼─────────┐                     │
│                        │  Auth Context    │                     │
│                        │  - Roles         │                     │
│                        │  - Sessions      │                     │
│                        └────────┬─────────┘                     │
│                                 │                               │
└─────────────────────────────────┼───────────────────────────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
        ┌───────────▼──────────┐    ┌──────────▼──────────┐
        │  PUBLIC PAGES        │    │  ADMIN PANEL        │
        ├──────────────────────┤    ├─────────────────────┤
        │ - Home              │    │ - Users (Mod)       │
        │ - Exhibitions List  │    │ - Publications      │
        │ - Exhibition Detail│    │ - Create User      │
        │ - News List        │    │ - Reports           │
        │ - News Detail      │    │ - Logs              │
        │ - Profile          │    │ - Dashboard         │
        │ - Participant      │    └─────────────────────┘
        │   Cabinet          │
        └───────────┬────────┘
                    │
                    │ Registration Flow
                    │
        ┌───────────▼──────────────┐
        │ RegistrationModal        │
        ├──────────────────────────┤
        │ Step 1: Form Data        │
        │ Step 2: Select City      │
        │ Step 3: Success Screen   │
        │                          │
        │ Actions:                 │
        │ - Email Service          │
        │ - Bitrix Integration     │
        │ - QR Code Generation     │
        └───────────┬──────────────┘
                    │
        ┌───────────┴──────────────────────┐
        │                                  │
        │         Data Flow                │
        │                                  │
        │  ┌────────────────────┐         │
        │  │  AdminContext      │         │
        │  ├────────────────────┤         │
        │  │ - exhibitions[]    │         │
        │  │ - news[]           │         │
        │  │ - users[]          │         │
        │  │ - registrations[]  │         │
        │  └────────────────────┘         │
        │           │                     │
        │  ┌────────▼────────┐            │
        │  │ Email Service   │            │
        │  ├─────────────────┤            │
        │  │ - sendEmail()   │────►Email  │
        │  │ - sendBitrix()  │────►Bitrix│
        │  └─────────────────┘            │
        │                                  │
        │  ┌────────────────────┐         │
        │  │  QR Code Generator │         │
        │  ├────────────────────┤         │
        │  │ - generateQR()    │         │
        │  └────────────────────┘         │
        │                                  │
        └──────────────────────────────────┘
```

## Поток регистрации на выставку

```
VISITOR JOURNEY
═════════════════════════════════════════════════════════════

1. DISCOVER
   ┌────────────────────────┐
   │ Visitor видит выставку │
   │ на главной странице    │
   │ или в списке           │
   └───────────┬────────────┘
               │
               ▼
           [Нажимает]
         "Зарегистрироваться"
               │
               ▼
2. OPEN MODAL
   ┌──────────────────────────┐
   │ RegistrationModal opens  │
   │ Step 1: Form Data        │
   └───────────┬──────────────┘
               │
           [Заполняет форму]
       Имя, Фамилия, Email, Телефон
               │
               ▼
           [Нажимает "Далее"]
               │
               ▼
3. SELECT CITY
   ┌──────────────────────────┐
   │ RegistrationModal        │
   │ Step 2: Select City      │
   │ - Москва                 │
   │ - СПб                    │
   │ - Казань                 │
   │ - и т.д.                │
   └───────────┬──────────────┘
               │
           [Выбирает город]
               │
               ▼
4. PROCESS (Backend)
   ┌────────────────────────────┐
   │ sendBitrixIntegration()    │
   │ - POST /bitrix/contact     │
   │ - Send: Name, Email, Phone │
   │ - Receive: Contact ID      │
   └───────────┬────────────────┘
               │
               ▼
   ┌────────────────────────────┐
   │ generateQRCode()           │
   │ - Generate QR data         │
   │ - Call qrserver.com API    │
   │ - Receive QR image URL     │
   └───────────┬────────────────┘
               │
               ▼
   ┌────────────────────────────┐
   │ addRegistration()          │
   │ - Save to AdminContext     │
   │ - Store in memory          │
   └───────────┬────────────────┘
               │
               ▼
   ┌────────────────────────────┐
   │ sendRegistrationEmail()    │
   │ - POST /email-service      │
   │ - Send: Welcome email      │
   │ - Include: QR code info    │
   └────────────────────────────┘
               │
               ▼
5. SUCCESS
   ┌──────────────────────────┐
   │ RegistrationModal        │
   │ Step 3: Success Screen   │
   │ - Show QR Code           │
   │ - Show Registration Info │
   │ - Confirmation Message   │
   └───────────┬──────────────┘
               │
           [Нажимает "Закрыть"]
               │
               ▼
6. VIEW IN CABINET
   Visitor переходит:
   /participant → "Мои выставки (QR)"
   
   Видит:
   ✓ Список регистраций
   ✓ QR коды
   ✓ Кнопки скачивания/показа
   ✓ Информация регистрации
```

## Компоненты и их взаимодействие

```
Pages:
├── /                           (Главная)
│   └── RegistrationModal ◄──── Click "Зарегистрироваться"
│
├── /exhibitions                (Список выставок)
│   └── ExhibitionCard
│       └── RegistrationModal
│
├── /exhibitions/[id]           (Детали выставки)
│   └── RegistrationModal
│
├── /participant                (Кабинет участника)
│   └── MyRegistrations
│       ├── QR Code Display
│       ├── Download Button
│       └── Show on Screen Button
│
└── /admin/*                    (Админ панель)
    ├── AdminSidebar
    ├── Users (Moderation)
    ├── Publications
    ├── Create User
    ├── Reports
    └── Logs

Core Contexts:
├── AuthContext
│   ├── user
│   ├── login()
│   ├── logout()
│   └── checkRole()
│
└── AdminContext
    ├── exhibitions[]
    ├── news[]
    ├── users[]
    ├── registrations[]
    ├── addRegistration()
    ├── getRegistrationsByUser()
    └── getRegistrationsByExhibition()

Services:
├── EmailService
│   ├── sendRegistrationEmail()
│   └── sendBitrixIntegration()
│
├── QR Code Generator
│   └── generateQRCode()
│
└── Types
    └── ExhibitionRegistration
```

## Структура данных

```
ExhibitionRegistration:
{
  id: string                  // "reg-1704067200000"
  exhibitionId: string        // "exp-1"
  userId: string              // "1"
  firstName: string           // "Иван"
  lastName: string            // "Петров"
  email: string              // "ivan@example.com"
  phone: string              // "+7 (999) 123-45-67"
  city: string               // "Москва"
  qrCode: string             // "https://api.qrserver.com/..."
  status: 'registered'       // или 'cancelled'
  registeredAt: Date         // Дата регистрации
  cancelledAt?: Date         // Опциональная дата отмены
}
```

## Развертывание и готовность к Production

### ✅ Что реализовано (Development)
- [x] Модальное окно регистрации
- [x] Трехэтапный процесс
- [x] Генерация QR-кодов (via qrserver.com API)
- [x] Email логирование (console.log)
- [x] Bitrix логирование (console.log)
- [x] Хранилище данных в памяти (AdminContext)
- [x] Отображение QR в личном кабинете

### 🔄 Для Production нужно добавить
- [ ] Реальная БД (PostgreSQL, MongoDB и т.д.)
- [ ] Реальный email сервис (SendGrid, Mailgun)
- [ ] Реальная интеграция Bitrix24 API
- [ ] Аутентификация API
- [ ] Rate limiting
- [ ] Error tracking (Sentry)
- [ ] Logging (ELK Stack)
- [ ] Кеширование (Redis)
- [ ] Масштабирование

## Безопасность

```
Authentication:
├── JWT tokens (в реальном приложении)
├── Role-based access control (RBAC)
├── Protected routes
└── Secure session management

Data Protection:
├── Input validation
├── Email validation
├── Phone validation
├── SQL injection prevention
└── CSRF protection
```
