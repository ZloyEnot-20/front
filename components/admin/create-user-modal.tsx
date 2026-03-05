'use client'

import React from "react"
import { useState } from 'react'
import { useLocale } from '@/lib/i18n'
import { useAdmin } from '@/lib/admin-context'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, KeyRound } from 'lucide-react'

interface CreateUserModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const ROLE_OPTIONS = [
  { value: 'visitor' as const, key: 'visitor' },
  { value: 'exhibitor' as const, key: 'roleExhibitor' },
  { value: 'staff' as const, key: 'roleStaff' },
  { value: 'content_manager' as const, key: 'contentManager' },
  { value: 'admin' as const, key: 'admin' },
]

export function CreateUserModal({ isOpen, onOpenChange }: CreateUserModalProps) {
  const { t } = useLocale()
  const { addUser } = useAdmin()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    universityName: '',
    email: '',
    phone: '',
    password: '',
    role: 'exhibitor' as 'visitor' | 'exhibitor' | 'staff' | 'content_manager' | 'admin',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isExhibitor = formData.role === 'exhibitor'

  function generateStrongPassword(): string {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    const lower = 'abcdefghjkmnpqrstuvwxyz'
    const numbers = '23456789'
    const symbols = '!@#$%&*'
    const pick = (s: string) => s[Math.floor(Math.random() * s.length)]
    let p = pick(upper) + pick(lower) + pick(numbers) + pick(symbols)
    const all = upper + lower + numbers + symbols
    for (let i = p.length; i < 12; i++) p += pick(all)
    return p.split('').sort(() => Math.random() - 0.5).join('')
  }

  const validateForm = () => {
    if (isExhibitor) {
      if (!formData.universityName.trim()) {
        setError(t('enterUniversityName'))
        return false
      }
    } else {
      if (!formData.firstName.trim()) {
        setError(t('enterFirstName'))
        return false
      }
      if (!formData.lastName.trim()) {
        setError(t('enterLastName'))
        return false
      }
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError(t('enterValidEmail'))
      return false
    }
    const phoneDigits = formData.phone.replace(/\D/g, '')
    const validPhone = (phoneDigits.length === 12 && phoneDigits.startsWith('998')) || (phoneDigits.length === 9 && !phoneDigits.startsWith('0'))
    if (!formData.phone.trim()) {
      setError(t('enterPhone'))
      return false
    }
    if (!validPhone) {
      setError(t('enterValidUzPhone'))
      return false
    }
    if (!formData.password || formData.password.length < 8) {
      setError(t('setPasswordHint'))
      return false
    }
    return true
  }

  const displayName = isExhibitor ? formData.universityName : `${formData.firstName} ${formData.lastName}`.trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setSaving(true)
    const newUser = {
      id: `user-${Date.now()}`,
      name: isExhibitor ? formData.universityName.trim() : `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Parameters<typeof addUser>[0]

    try {
      await addUser(newUser)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('createUserError'))
      return
    } finally {
      setSaving(false)
    }

    setTimeout(() => {
      setSuccess(false)
      setFormData({
        firstName: '',
        lastName: '',
        universityName: '',
        email: '',
        phone: '',
        password: '',
        role: 'exhibitor' as const,
      })
      onOpenChange(false)
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('createNewUser')}</DialogTitle>
          <DialogDescription>
            {t('createNewUserDesc')}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <p className="font-semibold mb-2">{t('userCreatedSuccess')}</p>
            <p className="text-sm text-muted-foreground">
              {displayName} {t('addedToSystem')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isExhibitor ? (
              <div>
                <label className="text-sm font-medium">{t('universityNameLabel')}</label>
                <Input
                  value={formData.universityName}
                  onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                  placeholder={t('universityPlaceholder')}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t('firstNameLabel')}</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder={t('firstNamePlaceholder')}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('lastNameLabel')}</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder={t('lastNamePlaceholder')}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ivan@example.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium">{t('phoneLabel')}</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+998 90 123 45 67"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <label className="text-sm font-medium">{t('passwordAdminLabel')}</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 h-8 text-xs"
                  onClick={() => setFormData({ ...formData, password: generateStrongPassword() })}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  {t('generatePassword')}
                </Button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="admin-create-user-password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t('passwordPlaceholder')}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">{t('role')}</label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as typeof formData.role })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {t(role.key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  t('createButton')
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
