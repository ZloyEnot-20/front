'use client'

import { useState, useEffect, useRef } from 'react'
import { User } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { authApi, getImageUrl, uploadFile } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Upload, Trash2, Plus } from 'lucide-react'

interface UniversityProfileSectionProps {
  user: User
}

export function UniversityProfileSection({ user }: UniversityProfileSectionProps) {
  const { refreshUser } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    exhibitorDescription: user.exhibitorDescription || '',
    exhibitorAddress: user.exhibitorAddress || '',
    exhibitorWebsite: user.exhibitorWebsite || '',
    avatar: user.avatar || '',
    exhibitorPhotos: [...(user.exhibitorPhotos || [])] as string[],
  })
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)

  useEffect(() => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      exhibitorDescription: user.exhibitorDescription || '',
      exhibitorAddress: user.exhibitorAddress || '',
      exhibitorWebsite: user.exhibitorWebsite || '',
      avatar: user.avatar || '',
      exhibitorPhotos: user.exhibitorPhotos ? [...user.exhibitorPhotos] : [],
    })
  }, [user])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaveError('')
    setIsSaving(true)
    try {
      await authApi.updateMe({
        name: formData.name.trim() || undefined,
        avatar: formData.avatar,
        phone: formData.phone.trim() || undefined,
        exhibitorDescription: formData.exhibitorDescription.trim() || undefined,
        exhibitorAddress: formData.exhibitorAddress.trim() || undefined,
        exhibitorWebsite: formData.exhibitorWebsite.trim() || undefined,
        exhibitorPhotos: formData.exhibitorPhotos.length ? formData.exhibitorPhotos : undefined,
      })
      await refreshUser()
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

  const avatarSrc = formData.avatar ? getImageUrl(formData.avatar) : null

  return (
    <div className="space-y-6">
      {/* Аватар профиля университета */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-0.5">Аватар профиля университета</h3>
        <p className="text-xs text-muted-foreground mb-3">Отображается на карточках участников на странице выставки</p>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-xl overflow-hidden border bg-muted flex-shrink-0 flex items-center justify-center">
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">{(formData.name || 'У').charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 w-fit"
              disabled={avatarUploading}
              onClick={() => avatarInputRef.current?.click()}
            >
              {avatarUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Загрузить аватар
            </Button>
            <Button type="button" variant="destructive" size="sm" className="gap-1.5 w-fit" onClick={handleAvatarRemove}>
              <Trash2 className="w-4 h-4" />
              Удалить аватар
            </Button>
          </div>
        </div>
      </div>

      {/* Название, Email, Телефон */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-xs text-muted-foreground">Название университета</label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Введите название"
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs text-muted-foreground">Email</label>
          <Input type="email" value={formData.email} disabled className="h-9 bg-muted" placeholder="Email" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-xs text-muted-foreground">Телефон</label>
        <Input
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="+7 (___) ___-__-__"
          className="h-9"
        />
      </div>

      {/* Описание университета */}
      <div className="space-y-2">
        <label className="block text-xs text-muted-foreground">Описание университета</label>
        <Textarea
          value={formData.exhibitorDescription}
          onChange={(e) => handleChange('exhibitorDescription', e.target.value)}
          placeholder="Краткое описание вашего университета"
          rows={4}
          className="min-h-20 resize-y"
        />
      </div>

      {/* Адрес, Сайт */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-xs text-muted-foreground">Адрес</label>
          <Input
            value={formData.exhibitorAddress}
            onChange={(e) => handleChange('exhibitorAddress', e.target.value)}
            placeholder="Город, улица, здание"
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs text-muted-foreground">Сайт</label>
          <Input
            type="url"
            value={formData.exhibitorWebsite}
            onChange={(e) => handleChange('exhibitorWebsite', e.target.value)}
            placeholder="https://..."
            className="h-9"
          />
        </div>
      </div>

      {/* Фото (до 10) */}
      <div>
        <label className="block text-xs text-muted-foreground mb-2">Фото (до 10)</label>
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
              {photoUploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              ) : (
                <Plus className="w-6 h-6 text-muted-foreground" />
              )}
            </label>
          )}
        </div>
      </div>

      {saveError && <p className="text-sm text-destructive">{saveError}</p>}

      <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto min-w-[140px] gap-2">
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Сохранить
      </Button>
    </div>
  )
}
