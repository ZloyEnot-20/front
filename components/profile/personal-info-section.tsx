'use client'

import { useState, useEffect, useRef } from 'react'
import { User } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { authApi, getImageUrl, uploadFile } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, CheckCircle2, Pencil, Upload, Trash2, Plus } from 'lucide-react'

const VISITOR_STATUS_OPTIONS = [
  { value: 'student', label: 'Студент' },
  { value: 'parent', label: 'Родитель' },
  { value: 'specialist', label: 'Специалист' },
] as const

const INTEREST_OPTIONS = [
  { value: 'Bachelor', label: 'Bachelor' },
  { value: 'Master', label: 'Master' },
  { value: 'MBA', label: 'MBA' },
  { value: 'Short Courses', label: 'Short Courses' },
  { value: 'School', label: 'School' },
] as const

const ADMISSION_PLAN_OPTIONS = [
  { value: '0-3', label: '0–3 мес.' },
  { value: '3-6', label: '3–6 мес.' },
  { value: '6-12', label: '6–12 мес.' },
  { value: '12+', label: '12+ мес.' },
] as const

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
    zipCode: '',
    visitorStatus: user.visitorStatus || '',
    languageKnowledge: user.languageKnowledge || '',
    interest: user.interest || '',
    countryOfInterest: user.countryOfInterest || '',
    admissionPlan: user.admissionPlan || '',
    exhibitorDescription: user.exhibitorDescription || '',
    exhibitorAddress: user.exhibitorAddress || '',
    exhibitorWebsite: user.exhibitorWebsite || '',
    name: user.name || '',
    avatar: user.avatar || '',
    exhibitorPhotos: [...(user.exhibitorPhotos || [])] as string[],
  })
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)

  useEffect(() => {
    const parts = (user.name || '').trim().split(/\s+/)
    setFormData((prev) => ({
      firstName: user.firstName ?? parts[0] ?? '',
      lastName: user.lastName ?? parts.slice(1).join(' ') ?? '',
      email: user.email || '',
      phone: user.phone || '',
      country: (user as User & { country?: string }).country || '',
      city: user.city || '',
      zipCode: '',
      visitorStatus: user.visitorStatus || '',
      languageKnowledge: user.languageKnowledge || '',
      interest: user.interest || '',
      countryOfInterest: user.countryOfInterest || '',
      admissionPlan: user.admissionPlan || '',
      exhibitorDescription: user.exhibitorDescription || '',
      exhibitorAddress: user.exhibitorAddress || '',
      exhibitorWebsite: user.exhibitorWebsite || '',
      name: user.name || '',
      avatar: user.avatar || prev.avatar || '',
      exhibitorPhotos: user.exhibitorPhotos ? [...user.exhibitorPhotos] : prev.exhibitorPhotos,
    }))
  }, [user])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaveError('')
    setIsSaving(true)
    try {
      const payload: Parameters<typeof authApi.updateMe>[0] = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
        city: formData.city.trim() || undefined,
        visitorStatus: (formData.visitorStatus || undefined) as 'student' | 'parent' | 'specialist' | undefined,
        languageKnowledge: formData.languageKnowledge.trim() || undefined,
        interest: (formData.interest || undefined) as 'Bachelor' | 'Master' | 'MBA' | 'Short Courses' | 'School' | undefined,
        countryOfInterest: formData.countryOfInterest.trim() || undefined,
        admissionPlan: (formData.admissionPlan || undefined) as '0-3' | '3-6' | '6-12' | '12+' | undefined,
      }
      if (user.role === 'exhibitor') {
        payload.name = formData.name.trim() || undefined
        payload.avatar = formData.avatar
        payload.exhibitorDescription = formData.exhibitorDescription.trim() || undefined
        payload.exhibitorAddress = formData.exhibitorAddress.trim() || undefined
        payload.exhibitorWebsite = formData.exhibitorWebsite.trim() || undefined
        payload.exhibitorPhotos = formData.exhibitorPhotos.length ? formData.exhibitorPhotos : undefined
      }
      await authApi.updateMe(payload)
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    setSaveError('')
    try {
      const { fileId } = await uploadFile(file)
      setFormData((prev) => ({ ...prev, avatar: fileId }))
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Ошибка загрузки аватара')
    } finally {
      setAvatarUploading(false)
      e.target.value = ''
    }
  }

  const handleAvatarRemove = () => {
    setFormData((prev) => ({ ...prev, avatar: '' }))
  }

  const handlePhotoAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (formData.exhibitorPhotos.length >= 10) return
    setPhotoUploading(true)
    setSaveError('')
    try {
      const { fileId } = await uploadFile(file)
      setFormData((prev) => ({
        ...prev,
        exhibitorPhotos: [...prev.exhibitorPhotos, fileId].slice(0, 10),
      }))
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Ошибка загрузки фото')
    } finally {
      setPhotoUploading(false)
      e.target.value = ''
    }
  }

  const handlePhotoRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      exhibitorPhotos: prev.exhibitorPhotos.filter((_, i) => i !== index),
    }))
  }

  // Профиль университета (экспонент): одна карточка с полной формой
  if (user.role === 'exhibitor') {
    const avatarSrc = formData.avatar ? getImageUrl(formData.avatar) : null
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6 max-w-2xl w-full">
              {/* Аватар */}
              <div>
                <label className="block text-sm font-medium mb-2">Аватар профиля университета</label>
                <p className="text-xs text-muted-foreground mb-2">Отображается на карточках участников на странице выставки</p>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border bg-muted flex-shrink-0 flex items-center justify-center">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-muted-foreground">{(formData.name || 'У').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={avatarUploading}
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      {avatarUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Загрузить аватар
                    </Button>
                    <Button type="button" variant="destructive" size="sm" className="gap-1.5" onClick={handleAvatarRemove}>
                      <Trash2 className="w-4 h-4" />
                      Удалить аватар
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Название университета</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Введите название"
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input type="email" value={formData.email} disabled className="h-9 bg-muted" placeholder="Email" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Телефон</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+7 (___) ___-__-__"
                  className="h-9"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Описание университета</label>
                <Textarea
                  value={formData.exhibitorDescription}
                  onChange={(e) => handleChange('exhibitorDescription', e.target.value)}
                  placeholder="Краткое описание вашего университета"
                  rows={4}
                  className="min-h-20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Адрес</label>
                  <Input
                    value={formData.exhibitorAddress}
                    onChange={(e) => handleChange('exhibitorAddress', e.target.value)}
                    placeholder="Город, улица, здание"
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Сайт</label>
                  <Input
                    type="url"
                    value={formData.exhibitorWebsite}
                    onChange={(e) => handleChange('exhibitorWebsite', e.target.value)}
                    placeholder="https://..."
                    className="h-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Фото (до 10)</label>
                <div className="flex flex-wrap gap-3">
                  {formData.exhibitorPhotos.map((fileId, index) => (
                    <div key={fileId} className="relative group">
                      <img src={getImageUrl(fileId)} alt="" className="h-24 w-24 rounded-lg object-cover border" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handlePhotoRemove(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {formData.exhibitorPhotos.length < 10 && (
                    <label className="h-24 w-24 rounded-lg border border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoAdd}
                        disabled={photoUploading}
                      />
                      {photoUploading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : <Plus className="w-6 h-6 text-muted-foreground" />}
                    </label>
                  )}
                </div>
              </div>

              {saveError && <p className="text-sm text-destructive">{saveError}</p>}
              <Button onClick={handleSave} disabled={isSaving} className="mt-4 gap-2">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Сохранить
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Личные данные (посетитель)
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
              <FieldRow label="Статус" value={VISITOR_STATUS_OPTIONS.find((o) => o.value === formData.visitorStatus)?.label ?? formData.visitorStatus} />
              <FieldRow label="Знание языков" value={formData.languageKnowledge} />
              <FieldRow label="Интерес" value={INTEREST_OPTIONS.find((o) => o.value === formData.interest)?.label ?? formData.interest} />
              <FieldRow label="Страна интереса" value={formData.countryOfInterest} />
              <FieldRow label="План поступления" value={ADMISSION_PLAN_OPTIONS.find((o) => o.value === formData.admissionPlan)?.label ?? formData.admissionPlan} />
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
            <>
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
                    value={formData.visitorStatus}
                    onValueChange={(v) => handleChange('visitorStatus', v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      {VISITOR_STATUS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
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
                    value={formData.interest}
                    onValueChange={(v) => handleChange('interest', v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Выберите интерес" />
                    </SelectTrigger>
                    <SelectContent>
                      {INTEREST_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
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
                    value={formData.admissionPlan}
                    onValueChange={(v) => handleChange('admissionPlan', v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Выберите план" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADMISSION_PLAN_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              {saveError && (
                <p className="text-sm text-destructive">{saveError}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
