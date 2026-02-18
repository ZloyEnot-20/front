'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { UserRole } from '@/lib/types'

export function SignupForm() {
  const router = useRouter()
  const { signup, isLoading } = useAuth()
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: 'visitor' as UserRole,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value as UserRole,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    try {
      await signup(formData.email, formData.name, formData.password, formData.role)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации')
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle>Регистрация</CardTitle>
        <CardDescription>Создайте новую учетную запись</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Иван Иванов"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@mail.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <Label>Я зарегистрируюсь как:</Label>
            <RadioGroup value={formData.role} onValueChange={handleRoleChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="visitor" id="visitor" />
                <Label htmlFor="visitor" className="font-normal cursor-pointer">
                  Посетитель (просмотр выставок)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="participant" id="participant" />
                <Label htmlFor="participant" className="font-normal cursor-pointer">
                  Участник (компания-участник)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="content_manager" id="content_manager" disabled />
                <Label htmlFor="content_manager" className="font-normal cursor-pointer text-muted-foreground">
                  Менеджер контента (только по приглашению)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Уже есть учетная запись?{' '}
          <a href="/auth/login" className="text-primary hover:underline">
            Войти
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
