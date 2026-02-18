# 🚀 Deployment Guide - Myfair Platform

## Локальная разработка

### Требования
- Node.js 18+ 
- npm или yarn
- Git

### Установка

```bash
# Клонировать репозиторий
git clone https://github.com/your-org/myfair.git
cd myfair

# Установить зависимости
npm install

# Запустить development сервер
npm run dev

# Открыть http://localhost:3000
```

### Переменные окружения

Создайте файл `.env.local`:

```env
# Это приложение работает локально и не требует переменных окружения
# Все данные хранятся в памяти приложения (AdminContext)

# Для production добавьте:
# DATABASE_URL=postgresql://...
# SENDGRID_API_KEY=SG...
# BITRIX_API_KEY=...
```

---

## Deployment на Vercel

### Самый простой способ (Рекомендуется)

1. **Подключитесь к GitHub**
   ```bash
   git push origin main
   ```

2. **Перейдите на Vercel.com**
   - Нажмите "New Project"
   - Выберите ваш GitHub репозиторий
   - Vercel автоматически определит Next.js
   - Нажмите "Deploy"

3. **Готово!** 
   - Vercel создаст URL вроде: `https://myfair-xyz.vercel.app`

### Вручную через Vercel CLI

```bash
# Установить Vercel CLI
npm install -g vercel

# Логин
vercel login

# Deploy
vercel

# Production
vercel --prod
```

---

## Environment Variables для Production

Добавьте в Vercel Settings → Environment Variables:

```env
# Email Service (SendGrid)
SENDGRID_API_KEY=SG_YOUR_KEY_HERE
SENDGRID_FROM_EMAIL=noreply@myfair.com

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/myfair
DATABASE_SSL=true

# Bitrix24 Integration
BITRIX_DOMAIN=your-domain.bitrix24.ru
BITRIX_API_TOKEN=YOUR_TOKEN_HERE

# Application
NEXT_PUBLIC_APP_URL=https://myfair.com
NODE_ENV=production

# Security
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRE=7d
```

---

## Build и Production

### Build локально

```bash
# Build приложения
npm run build

# Запустить production сервер
npm run start

# Проверить size bundle
npm run analyze  # если настроен
```

### Оптимизация для production

#### 1. Image Optimization

```tsx
// Используйте next/image для всех изображений
import Image from 'next/image'

<Image
  src="/exhibitions/techexpo.jpg"
  alt="TechExpo"
  width={1200}
  height={600}
  priority  // для критичных изображений
/>
```

#### 2. Font Optimization

Next.js автоматически оптимизирует шрифты из Google Fonts.

#### 3. Bundle Analysis

```bash
npm install @next/bundle-analyzer

# Добавьте в next.config.mjs:
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
```

---

## Database Setup (для production)

### PostgreSQL (Рекомендуется)

1. **Создайте БД на Vercel Postgres / AWS RDS / Google Cloud SQL**

2. **Обновите `/lib/db.ts`:**

```typescript
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function query(sql: string, params: any[] = []) {
  const result = await pool.query(sql, params)
  return result.rows
}
```

3. **Миграции:**

```bash
npm install @vercel/postgres

# Создайте ./migrations/001-init.sql
# Запустите миграции перед deployment
```

### MongoDB (Альтернатива)

```typescript
import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI)
const db = client.db('myfair')

export async function getRegistrations() {
  return db.collection('registrations').find({}).toArray()
}
```

---

## Email Integration (для production)

### SendGrid

1. **Получите API Key с sendgrid.com**

2. **Обновите `/lib/email-service.ts`:**

```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendRegistrationEmail(data: EmailData) {
  try {
    await sgMail.send({
      to: data.to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: data.subject,
      html: generateEmailTemplate(data),
      attachments: [{
        filename: 'qr-code.png',
        content: await downloadQRCode(data.qrCodeUrl),
        type: 'image/png',
      }],
    })
    return true
  } catch (error) {
    console.error('[email] Error:', error)
    return false
  }
}
```

### Mailgun (Альтернатива)

```typescript
import Mailgun from 'mailgun.js'

const mailgun = new Mailgun(FormData)
const client = mailgun.client({ 
  username: 'api', 
  key: process.env.MAILGUN_API_KEY! 
})

export async function sendRegistrationEmail(data: EmailData) {
  return client.messages.create(process.env.MAILGUN_DOMAIN!, {
    from: 'Myfair <noreply@myfair.com>',
    to: data.to,
    subject: data.subject,
    html: generateEmailTemplate(data),
  })
}
```

---

## Bitrix24 Integration (для production)

### Интеграция

1. **Получите токен из Bitrix24**

2. **Обновите `/lib/email-service.ts`:**

```typescript
export async function sendBitrixIntegration(data: {
  firstName: string
  lastName: string
  email: string
  phone: string
  exhibitionId: string
  city: string
}) {
  try {
    const response = await fetch(
      `https://${process.env.BITRIX_DOMAIN}/rest/1/${process.env.BITRIX_API_TOKEN}/crm.contact.add`,
      {
        method: 'POST',
        body: JSON.stringify({
          fields: {
            NAME: data.firstName,
            LAST_NAME: data.lastName,
            EMAIL: [{ VALUE: data.email, VALUE_TYPE: 'WORK' }],
            PHONE: [{ VALUE: data.phone, VALUE_TYPE: 'WORK' }],
            COMMENTS: `Exhibition: ${data.exhibitionId}, City: ${data.city}`,
          },
          params: { REGISTER_SONET_EVENT: 'Y' },
        }),
      }
    )

    const result = await response.json()
    return result.result !== undefined
  } catch (error) {
    console.error('[bitrix] Error:', error)
    return false
  }
}
```

---

## Monitoring и Logging

### Sentry (Error Tracking)

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

### Vercel Analytics

Автоматически включена в Vercel. Смотрите на vercel.com/dashboard.

### LogRocket (Session Replay)

```bash
npm install logrocket
```

```typescript
import LogRocket from 'logrocket'

LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_ID!)
```

---

## Performance Optimization

### Caching Headers

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Cache static files for 1 year
  if (request.nextUrl.pathname.match(/\.(js|css|png|jpg)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }
  
  // Cache HTML for 1 hour
  if (request.nextUrl.pathname.match(/\.html$/)) {
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600')
  }
  
  return response
}
```

### Database Caching (Redis)

```bash
npm install redis
```

```typescript
import { redis } from '@/lib/redis'

export async function getExhibition(id: string) {
  // Проверить кеш
  const cached = await redis.get(`exhibition:${id}`)
  if (cached) return JSON.parse(cached)

  // Получить из БД
  const data = await db.query('SELECT * FROM exhibitions WHERE id = $1', [id])
  
  // Сохранить в кеш на 1 час
  await redis.setex(`exhibition:${id}`, 3600, JSON.stringify(data[0]))
  
  return data[0]
}
```

---

## Security Checklist

- [ ] Обновите все зависимости: `npm audit fix`
- [ ] Установите helmet для заголовков: `npm install helmet`
- [ ] Включите HTTPS (автоматически на Vercel)
- [ ] Установите rate limiting: `npm install express-rate-limit`
- [ ] Включите CORS если необходимо
- [ ] Скрывайте чувствительную информацию в .env
- [ ] Используйте JWT для аутентификации
- [ ] Валидируйте все входные данные
- [ ] Используйте CSRF токены для форм

---

## Domains & SSL

### Подключить свой домен на Vercel

1. Перейдите Vercel Dashboard → Project → Settings → Domains
2. Добавьте ваш домен
3. Обновите DNS записи (CNAME или A record)
4. SSL автоматически настроится

### Custom Domain пример

```
Domain: myfair.com
DNS CNAME: cname.vercel-dns.com

Или A record:
76.76.19.132
```

---

## CI/CD Pipeline

### GitHub Actions

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm install
      - run: npm run build
      - run: npm run test  # если есть
      
      - uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Backup и Recovery

### Database Backup

```bash
# PostgreSQL
pg_dump myfair > backup-$(date +%Y%m%d).sql

# Restore
psql myfair < backup-20240128.sql
```

### Vercel Backup

Автоматически: Vercel хранит git history. Используйте GitHub для резервной копии.

---

## Troubleshooting

### Error: "Module not found"
```bash
rm -rf node_modules
npm install
npm run build
```

### Error: "Out of memory"
```bash
# Увеличьте Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### Error: "Build takes too long"
- Оптимизируйте изображения
- Используйте динамические импорты
- Уменьшите bundle размер

### Production медленный
- Включите caching
- Добавьте CDN (Cloudflare)
- Оптимизируйте БД queries
- Используйте Redis для кеша

---

## Rollback

### На Vercel
Нажмите "Redeploy" на предыдущем deployment.

### На GitHub
```bash
git revert <commit-hash>
git push origin main
```

---

## Monitoring & Alerts

### Vercel Alerts
Settings → Alerts → Создайте alert для:
- Deployment failures
- Performance issues
- Error rates

### Custom Alerts

```typescript
// Отправить email при ошибке
import { sendAlert } from '@/lib/alerts'

try {
  // код
} catch (error) {
  await sendAlert({
    subject: 'Critical Error in Production',
    message: error.message,
  })
}
```

---

## Финальный Checklist

- [ ] Все Environment Variables установлены
- [ ] БД мигрирована
- [ ] Email сервис настроен
- [ ] Bitrix интеграция работает
- [ ] Тесты проходят
- [ ] Bundle size оптимизирован
- [ ] Security audit пройден
- [ ] Monitoring включен
- [ ] Backup настроен
- [ ] Custom domain подключен

---

**Статус:** Готово к deployment
**Дата:** 28.01.2026
**Версия:** 1.0.0
