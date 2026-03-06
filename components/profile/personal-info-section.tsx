'use client'

import { useState, useEffect } from 'react'
import { User } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { authApi } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CheckCircle2, Pencil } from 'lucide-react'

const VISITOR_STATUS_OPTIONS = [
  { value: 'student', label: 'Студент' },
  { value: 'parent', label: 'Родитель' },
  { value: 'specialist', label: 'Специалист' },
] as const
const INTEREST_OPTIONS = ['Bachelor', 'Master', 'MBA', 'Short Courses', 'School'] as const
const ADMISSION_PLAN_OPTIONS = [
  { value: '0-3', label: '0–3 мес.' },
  { value: '3-6', label: '3–6 мес.' },
  { value: '6-12', label: '6–12 мес.' },
  { value: '12+', label: '12+ мес.' },
] as const

function visitorStatusLabel(v: string) {
  return (VISITOR_STATUS_OPTIONS.find((o) => o.value === v)?.label ?? v) || '—'
}
function admissionPlanLabel(v: string) {
  return (ADMISSION_PLAN_OPTIONS.find((o) => o.value === v)?.label ?? v) || '—'
}

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
  const { refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const nameParts = (user.name || '').trim().split(/\s+/)
  const [formData, setFormData] = useState({
    firstName: user.firstName ?? nameParts[0] ?? '',
    lastName: user.lastName ?? nameParts.slice(1).join(' ') ?? '',
    email: user.email || '',
    phone: user.phone || '',
    country: (user as User & { country?: string }).country || '',
    city: user.city || '',
    visitorStatus: user.visitorStatus || '',
    languageKnowledge: user.languageKnowledge || '',
    interest: user.interest || '',
    countryOfInterest: user.countryOfInterest || '',
    admissionPlan: user.admissionPlan || '',
  })

  useEffect(() => {
    const parts = (user.name || '').trim().split(/\s+/)
    setFormData({
      firstName: user.firstName ?? parts[0] ?? '',
      lastName: user.lastName ?? parts.slice(1).join(' ') ?? '',
      email: user.email || '',
      phone: user.phone || '',
      country: (user as User & { country?: string }).country || '',
      city: user.city || '',
      visitorStatus: user.visitorStatus || '',
      languageKnowledge: user.languageKnowledge || '',
      interest: user.interest || '',
      countryOfInterest: user.countryOfInterest || '',
      admissionPlan: user.admissionPlan || '',
    })
  }, [user])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaveError('')
    setIsSaving(true)
    try {
      await authApi.updateMe({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
        city: formData.city.trim() || undefined,
        visitorStatus: (formData.visitorStatus || undefined) as 'student' | 'parent' | 'specialist' | undefined,
        languageKnowledge: formData.languageKnowledge.trim() || undefined,
        interest: (formData.interest || undefined) as 'Bachelor' | 'Master' | 'MBA' | 'Short Courses' | 'School' | undefined,
        countryOfInterest: formData.countryOfInterest.trim() || undefined,
        admissionPlan: (formData.admissionPlan || undefined) as '0-3' | '3-6' | '6-12' | '12+' | undefined,
      })
      await refreshUser()
      setSaved(true)
      setIsEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setIsSaving(false)
    }
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
              variant="default"
              size="sm"
              className="rounded-md gap-2"
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
              <FieldRow label="Статус" value={visitorStatusLabel(formData.visitorStatus)} />
              <FieldRow label="Знание языков" value={formData.languageKnowledge} />
              <FieldRow label="Интерес" value={formData.interest} />
              <FieldRow label="Страна интереса" value={formData.countryOfInterest} />
              <FieldRow label="План поступления" value={admissionPlanLabel(formData.admissionPlan)} />
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
                <Input
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="Введите страну"
                  className="h-9"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Город</label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Введите город"
                  className="h-9"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Статус</label>
                <Select
                  value={formData.visitorStatus || undefined}
                  onValueChange={(v) => handleChange('visitorStatus', v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    {VISITOR_STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Знание языков</label>
                <Input
                  value={formData.languageKnowledge}
                  onChange={(e) => handleChange('languageKnowledge', e.target.value)}
                  placeholder="Например: Английский B2"
                  className="h-9"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Интерес</label>
                <Select
                  value={formData.interest || undefined}
                  onValueChange={(v) => handleChange('interest', v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Выберите интерес" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTEREST_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Страна интереса</label>
                <Input
                  value={formData.countryOfInterest}
                  onChange={(e) => handleChange('countryOfInterest', e.target.value)}
                  placeholder="Необязательно"
                  className="h-9"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">План поступления</label>
                <Select
                  value={formData.admissionPlan || undefined}
                  onValueChange={(v) => handleChange('admissionPlan', v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Выберите план" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMISSION_PLAN_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {user.role === 'visitor' && saveError && (
            <p className="text-sm text-destructive">{saveError}</p>
          )}
        </div>
      )}
    </div>
  )
}
