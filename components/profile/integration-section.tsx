'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function IntegrationSection() {
  return (
    <div className="flex-1 p-8">
      <h1 className="text-3xl font-bold mb-8">Интеграции</h1>

      <div className="space-y-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Подключённые сервисы</CardTitle>
            <CardDescription>Управление подключёнными приложениями</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Google Календарь', connected: true },
              { name: 'Microsoft Outlook', connected: false },
              { name: 'Slack', connected: false },
            ].map((service) => (
              <div key={service.name} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {service.connected ? 'Подключено' : 'Не подключено'}
                  </p>
                </div>
                <Button variant="outline">{service.connected ? 'Отключить' : 'Подключить'}</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API</CardTitle>
            <CardDescription>Управление API-токенами</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Создать API-токен</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
