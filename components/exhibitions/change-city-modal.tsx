'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { registrationsApi } from '@/lib/api'
import { Loader2 } from 'lucide-react'

interface ChangeCityModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  registrationId: string
  currentCity: string
  /** Список городов выставки (названия) */
  cities: string[]
  onSuccess: () => void
}

export function ChangeCityModal({
  isOpen,
  onOpenChange,
  registrationId,
  currentCity,
  cities,
  onSuccess,
}: ChangeCityModalProps) {
  const [selectedCity, setSelectedCity] = useState<string>(currentCity)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    const city = selectedCity.trim()
    if (!city || city === currentCity) return
    setSaving(true)
    setError('')
    try {
      await registrationsApi.updateCity(registrationId, city)
      onSuccess()
      onOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const otherCities = cities.filter((c) => c.trim() && c !== currentCity)
  if (otherCities.length === 0) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Изменить город</DialogTitle>
          <DialogDescription>
            Выберите новый город посещения. Регистрация и QR-код будут обновлены.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">Текущий город: <strong>{currentCity}</strong></p>
          <div className="space-y-2">
            <label className="text-sm font-medium">Новый город</label>
            <div className="flex flex-wrap gap-2">
              {otherCities.map((city) => (
                <Button
                  key={city}
                  type="button"
                  variant={selectedCity === city ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCity(city)}
                >
                  {city}
                </Button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Отмена
            </Button>
            <Button onClick={handleSubmit} disabled={saving || selectedCity === currentCity}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
