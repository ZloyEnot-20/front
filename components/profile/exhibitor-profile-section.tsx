'use client'

import { useState, useEffect } from 'react'
import { User } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { authApi, getImageUrl, uploadFile } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Loader2, CheckCircle2, Trash2, Plus } from 'lucide-react'

const MAX_PHOTOS = 10
const MAX_FILE_MB = 5

export function ExhibitorProfileSection() {
  const { user, refreshUser } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    exhibitorDescription: (user as User)?.exhibitorDescription ?? '',
    exhibitorAddress: (user as User)?.exhibitorAddress ?? '',
    exhibitorWebsite: (user as User)?.exhibitorWebsite ?? '',
    exhibitorPhotos: (user as User)?.exhibitorPhotos ?? [] as string[],
  })
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    if (user) {
      const u = user as User
      setFormData({
        exhibitorDescription: u.exhibitorDescription ?? '',
        exhibitorAddress: u.exhibitorAddress ?? '',
        exhibitorWebsite: u.exhibitorWebsite ?? '',
        exhibitorPhotos: u.exhibitorPhotos ?? [],
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    setSaved(false)
    try {
      await authApi.updateMe({
        exhibitorDescription: formData.exhibitorDescription,
        exhibitorAddress: formData.exhibitorAddress,
        exhibitorWebsite: formData.exhibitorWebsite,
        exhibitorPhotos: formData.exhibitorPhotos,
      })
      await refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || formData.exhibitorPhotos.length >= MAX_PHOTOS) return
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      alert(`Файл не более ${MAX_FILE_MB} МБ`)
      return
    }
    setUploadingPhoto(true)
    try {
      const { fileId, url } = await uploadFile(file)
      const photoUrl = url ?? getImageUrl(fileId) ?? fileId
      setFormData((prev) => ({ ...prev, exhibitorPhotos: [...prev.exhibitorPhotos, photoUrl] }))
      setSaved(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setUploadingPhoto(false)
      e.target.value = ''
    }
  }

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      exhibitorPhotos: prev.exhibitorPhotos.filter((_, i) => i !== index),
    }))
    setSaved(false)
  }

  return (
    <div className="flex-1 p-8 flex flex-col items-center justify-center">
      <div className="flex justify-between items-start mb-8">
        {isSaving && (
          <div className="flex items-center gap-2 text-primary">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Сохранение...</span>
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm">Изменения сохранены</span>
          </div>
        )}
      </div>

      <div className="space-y-6 max-w-2xl w-full">
        <div>
          <label className="block text-sm font-medium mb-2">Описание университета</label>
          <Textarea
            value={formData.exhibitorDescription}
            onChange={(e) => setFormData((p) => ({ ...p, exhibitorDescription: e.target.value }))}
            placeholder="Краткое описание вашего университета"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Адрес</label>
          <Input
            value={formData.exhibitorAddress}
            onChange={(e) => setFormData((p) => ({ ...p, exhibitorAddress: e.target.value }))}
            placeholder="Город, улица, здание"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Сайт</label>
          <Input
            type="url"
            value={formData.exhibitorWebsite}
            onChange={(e) => setFormData((p) => ({ ...p, exhibitorWebsite: e.target.value }))}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Фото (до {MAX_PHOTOS})</label>
          <div className="flex flex-wrap gap-3">
            {formData.exhibitorPhotos.map((url, i) => (
              <div key={i} className="relative group">
                <img
                  src={getImageUrl(url) || url}
                  alt=""
                  className="h-24 w-24 rounded-lg object-cover border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removePhoto(i)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {formData.exhibitorPhotos.length < MAX_PHOTOS && (
              <label className="h-24 w-24 rounded-lg border border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingPhoto}
                  onChange={handlePhotoUpload}
                />
                {uploadingPhoto ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : <Plus className="w-6 h-6 text-muted-foreground" />}
              </label>
            )}
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="mt-4">
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>
    </div>
  )
}
