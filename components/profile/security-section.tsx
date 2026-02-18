'use client'

import { useAuth } from '@/lib/auth-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useState } from 'react'

export function SecuritySection() {
  const { user } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex justify-center items-center flex-1 p-8">
      {/* <h1 className="text-3xl font-bold mb-8">Почта и пароль</h1> */}

      <div className="space-y-6 max-w-2xl w-full">
        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
            <CardDescription>Основной email для восстановления аккаунта</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="email" value={user?.email ?? ''} disabled className="bg-muted" />
            <Button variant="outline">Изменить email</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Пароль</CardTitle>
            <CardDescription>Используйте надёжный пароль для безопасности</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Текущий пароль</label>
              <Input type={showPassword ? 'text' : 'password'} placeholder="Введите текущий пароль" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Новый пароль</label>
              <Input type={showPassword ? 'text' : 'password'} placeholder="Введите новый пароль" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Подтвердите пароль</label>
              <Input type={showPassword ? 'text' : 'password'} placeholder="Повторите новый пароль" />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-pwd"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="show-pwd" className="text-sm cursor-pointer">Показать пароли</label>
            </div>
            <Button>Обновить пароль</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Двухфакторная аутентификация</CardTitle>
            <CardDescription>Дополнительная защита вашего аккаунта</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Включить 2FA</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
