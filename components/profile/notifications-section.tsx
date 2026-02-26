'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function NotificationsSection() {
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    registrationConfirm: true,
    exhibitionReminders: true,
    newsAlerts: false,
    promotions: false,
  })

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="flex-1 p-8">
      <h1 className="text-3xl font-bold mb-8">Уведомления</h1>

      <div className="space-y-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Email-уведомления</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'emailUpdates', label: 'Обновления аккаунта', desc: 'Уведомления об изменениях в аккаунте' },
              { key: 'registrationConfirm', label: 'Подтверждение регистрации', desc: 'Подтверждение ваших регистраций' },
              { key: 'exhibitionReminders', label: 'Напоминания о выставках', desc: 'Предстоящие выставки, на которые вы зарегистрированы' },
              { key: 'newsAlerts', label: 'Новости', desc: 'Последние новости платформы' },
              { key: 'promotions', label: 'Рекламные рассылки', desc: 'Специальные предложения' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={() => handleToggle(item.key as keyof typeof notifications)}
                  className="w-5 h-5 rounded"
                />
              </div>
            ))}
            <Button>Сохранить настройки</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
