'use client'

import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useState } from 'react'

export function SecuritySection() {
  const { t } = useLocale()
  const { user } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex justify-center items-center flex-1 p-8">
      <div className="space-y-6 max-w-2xl w-full">
        <Card>
          <CardHeader>
            <CardTitle>{t('emailLabel')}</CardTitle>
            <CardDescription>{t('emailCardDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="email" value={user?.email ?? ''} disabled className="bg-muted" />
            <Button variant="outline">{t('changeEmail')}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('passwordCardTitle')}</CardTitle>
            <CardDescription>{t('passwordCardDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">{t('currentPassword')}</label>
              <Input type={showPassword ? 'text' : 'password'} placeholder={t('enterCurrentPassword')} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">{t('newPassword')}</label>
              <Input type={showPassword ? 'text' : 'password'} placeholder={t('enterNewPassword')} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">{t('confirmPassword')}</label>
              <Input type={showPassword ? 'text' : 'password'} placeholder={t('repeatNewPassword')} />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-pwd"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="show-pwd" className="text-sm cursor-pointer">{t('showPasswords')}</label>
            </div>
            <Button>{t('updatePassword')}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('twoFactorTitle')}</CardTitle>
            <CardDescription>{t('twoFactorDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">{t('enable2FA')}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
