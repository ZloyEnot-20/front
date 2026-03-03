'use client'

import React from "react"

import { useState } from 'react'
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
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface CreateUserModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const ROLES = [
  { value: 'visitor', label: 'Посетитель' },
  { value: 'exhibitor', label: 'Экспонент (Exhibitor)' },
  { value: 'staff', label: 'Сотрудник (Staff)' },
  { value: 'content_manager', label: 'Менеджер контента (Content Manager)' },
  { value: 'admin', label: 'Администратор' },
]

export function CreateUserModal({ isOpen, onOpenChange }: CreateUserModalProps) {
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

  const isExhibitor = formData.role === 'exhibitor'

  const validateForm = () => {
    if (isExhibitor) {
      if (!formData.universityName.trim()) {
        setError('Введите название университета')
        return false
      }
    } else {
      if (!formData.firstName.trim()) {
        setError('Введите имя')
        return false
      }
      if (!formData.lastName.trim()) {
        setError('Введите фамилию')
        return false
      }
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Введите корректный email')
      return false
    }
    if (!formData.phone.trim()) {
      setError('Введите номер телефона')
      return false
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Задайте пароль (не менее 6 символов)')
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
      setError(err instanceof Error ? err.message : 'Ошибка создания пользователя')
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
          <DialogTitle>Создать нового пользователя</DialogTitle>
          <DialogDescription>
            Заполните форму для добавления нового пользователя в систему
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <p className="font-semibold mb-2">Пользователь создан успешно!</p>
            <p className="text-sm text-muted-foreground">
              {displayName} был добавлен в систему
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isExhibitor ? (
              <div>
                <label className="text-sm font-medium">Название университета</label>
                <Input
                  value={formData.universityName}
                  onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                  placeholder="МГУ им. М. В. Ломоносова"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Имя</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Иван"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Фамилия</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Петров"
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
              <label className="text-sm font-medium">Номер телефона</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (900) 123-45-67"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Пароль (задаётся администратором)</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Роль</label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as typeof formData.role })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
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
                Отмена
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Создание...
                  </>
                ) : (
                  'Создать'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
