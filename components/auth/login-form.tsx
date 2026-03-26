'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n/translations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function LoginForm({ localePrefix = 'uz' }: { localePrefix?: Lang }) {
  const router = useRouter()
  const { t } = useLocale()
  const { login, isLoading, user } = useAuth()
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [postLoginRedirect, setPostLoginRedirect] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(formData.email, formData.password)
      setPostLoginRedirect(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loginError'))
    }
  }

  // После логина редиректим только когда `user` действительно доступен в контексте
  // (чтобы не было гонок по setState).
  useEffect(() => {
    if (!postLoginRedirect) return
    if (isLoading) return
    if (!user) return

    if (user.role === 'exhibitor') {
      router.push('/profile')
      return
    }

    router.push('/main')
  }, [postLoginRedirect, isLoading, user, router])

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle>{t('loginTitle')}</CardTitle>
        <CardDescription>{t('loginDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
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
            <Label htmlFor="password">{t('password')}</Label>
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('loggingIn') : t('loginButton')}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {t('noAccount')}{' '}
          <a href="/auth/signup" className="text-primary hover:underline">
            {t('registerLink')}
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
