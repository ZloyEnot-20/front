'use client'

import { useState, useEffect } from 'react'
import { User } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, Pencil } from 'lucide-react'

interface PersonalInfoSectionProps {
  user: User
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || '—'}</p>
    </div>
  )
}

export function PersonalInfoSection({ user }: PersonalInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user.name.split(' ')[0] || '',
    lastName: user.name.split(' ')[1] || '',
    email: user.email || '',
    phone: (user as User & { phone?: string }).phone || '',
    country: 'Россия',
    city: 'Москва',
    zipCode: '',
  })

  useEffect(() => {
    setFormData({
      firstName: user.name.split(' ')[0] || '',
      lastName: user.name.split(' ')[1] || '',
      email: user.email || '',
      phone: (user as User & { phone?: string }).phone || '',
      country: 'Россия',
      city: 'Москва',
      zipCode: '',
    })
  }, [user])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaved(true)
    setIsEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-lg font-bold text-foreground">Личные данные</h3>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              Сохранено
            </span>
          )}
          {!isEditing ? (
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full gap-2"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="w-4 h-4" />
              Редактировать
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Отмена
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Сохранить'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FieldRow label="Имя" value={formData.firstName} />
          <FieldRow label="Фамилия" value={formData.lastName} />
          <FieldRow label="Email" value={formData.email} />
          <FieldRow label="Телефон" value={formData.phone} />
          {user.role === 'visitor' && (
            <>
              <FieldRow label="Страна" value={formData.country} />
              <FieldRow label="Город" value={formData.city} />
              <div className="sm:col-span-2">
                <FieldRow label="Почтовый индекс" value={formData.zipCode} />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Имя</label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Введите имя"
                className="h-9"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Фамилия</label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Введите фамилию"
                className="h-9"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Введите email"
                className="h-9"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Телефон</label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Введите номер"
                className="h-9"
              />
            </div>
          </div>

          {user.role === 'visitor' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Страна</label>
                <select
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                >
                  <option>Россия</option>
                  <option>США</option>
                  <option>Канада</option>
                  <option>Великобритания</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Город</label>
                <select
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                >
                  <option>Москва</option>
                  <option>Санкт-Петербург</option>
                  <option>Новосибирск</option>
                  <option>Екатеринбург</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-muted-foreground mb-1.5">Почтовый индекс</label>
                <Input
                  value={formData.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                  placeholder="Введите индекс"
                  className="h-9"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
