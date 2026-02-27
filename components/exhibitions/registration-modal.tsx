'use client'

import { useState, useEffect } from 'react'
import { useAdmin } from '@/lib/admin-context'
import { useAuth } from '@/lib/auth-context'
import { registrationsApi } from '@/lib/api'
import { sendRegistrationEmail, sendBitrixIntegration } from '@/lib/email-service'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'

const DEFAULT_CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Новосибирск',
  'Екатеринбург',
  'Сочи',
]

const REGISTRATION_RECENT_CITIES_KEY = 'registration_recent_cities'

function getRecentCities(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(REGISTRATION_RECENT_CITIES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCityToRecent(city: string) {
  if (typeof window === 'undefined') return
  const prev = getRecentCities()
  const next = [city, ...prev.filter((c) => c !== city)].slice(0, 15)
  localStorage.setItem(REGISTRATION_RECENT_CITIES_KEY, JSON.stringify(next))
}

interface RegistrationModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  exhibitionId: string
  exhibitionTitle: string
  cities?: string[]
}

export function RegistrationModal({
  isOpen,
  onOpenChange,
  exhibitionId,
  exhibitionTitle,
  cities: exhibitionCities = [],
}: RegistrationModalProps) {
  const { user } = useAuth()
  const { addRegistration, incrementExhibitionRegistrations } = useAdmin()
  const [step, setStep] = useState<'city' | 'success'>('city')
  const [registration, setRegistration] = useState<any>(null)
  const [error, setError] = useState('')
  const [loadingCity, setLoadingCity] = useState<string | null>(null)
  const [recentCities, setRecentCities] = useState<string[]>([])

  const displayCities = exhibitionCities.length > 0 ? exhibitionCities : DEFAULT_CITIES

  useEffect(() => {
    if (isOpen) {
      setStep('city')
      setRegistration(null)
      setError('')
      setLoadingCity(null)
      setRecentCities(getRecentCities())
    }
  }, [isOpen])

  const handleCitySelect = async (city: string) => {
    if (!user) return
    setLoadingCity(city)
    setError('')

    try {
      const created = await registrationsApi.create({ exhibitionId, city })

      const newRegistration = {
        id: created.id,
        exhibitionId,
        userId: created.userId,
        firstName: created.firstName,
        lastName: created.lastName,
        email: created.email,
        phone: created.phone,
        city: created.city,
        qrCode: created.qrCode,
        status: 'registered' as const,
        registeredAt: new Date(created.registeredAt),
      }

      saveCityToRecent(city)
      addRegistration(newRegistration)
      incrementExhibitionRegistrations(exhibitionId)
      setRegistration(newRegistration)
      setStep('success')

      sendBitrixIntegration({
        firstName: created.firstName,
        lastName: created.lastName,
        email: created.email,
        phone: created.phone,
        exhibitionId,
        city,
      }).catch(console.error)
      sendRegistrationEmail({
        to: created.email,
        subject: `Подтверждение регистрации на выставку "${exhibitionTitle}"`,
        firstName: created.firstName,
        lastName: created.lastName,
        exhibitionTitle,
        city,
        qrCodeUrl: created.qrCode,
        registrationId: created.id,
      }).catch(console.error)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка при регистрации. Попробуйте снова.'
      setError(message)
      console.error('[Registration]', err)
    } finally {
      setLoadingCity(null)
    }
  }

  const handleClose = () => {
    setStep('city')
    setRegistration(null)
    setError('')
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {!user ? (
          <>
            <DialogHeader>
              <DialogTitle>Регистрация на выставку</DialogTitle>
              <DialogDescription>{exhibitionTitle}</DialogDescription>
            </DialogHeader>
            <Alert>
              <AlertDescription>
                Войдите в аккаунт, чтобы зарегистрироваться на выставку.
              </AlertDescription>
            </Alert>
            <Button asChild>
              <Link href="/login">Войти</Link>
            </Button>
          </>
        ) : step === 'city' ? (
          <>
            <DialogHeader>
              <DialogTitle>Выберите город</DialogTitle>
              <DialogDescription>Выберите город для посещения выставки</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-1 gap-2">
                {displayCities.map((city) => (
                  <Button
                    key={city}
                    variant="outline"
                    className="justify-start"
                    onClick={() => handleCitySelect(city)}
                    disabled={!!loadingCity}
                  >
                    {loadingCity === city ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Обработка...
                      </>
                    ) : (
                      city
                    )}
                  </Button>
                ))}
              </div>
              {recentCities.filter((c) => !displayCities.includes(c)).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Недавние:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {recentCities
                      .filter((c) => !displayCities.includes(c))
                      .map((city) => (
                        <Button
                          key={city}
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleCitySelect(city)}
                          disabled={!!loadingCity}
                        >
                          {loadingCity === city ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            city
                          )}
                        </Button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          step === 'success' &&
          registration && (
            <>
              <DialogHeader>
                <DialogTitle>Регистрация завершена</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Вы зарегистрированы на выставку. Сохраните QR-код и предъявите его на входе.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-center p-4 bg-muted/50 rounded-lg">
                  <img src={registration.qrCode} alt="QR Code" className="w-48 h-48" loading="lazy" />
                </div>

                <div className="bg-muted/50 border rounded-lg p-3 text-sm space-y-1">
                  <p className="font-medium">Ваш уникальный QR-код</p>
                  <p className="text-muted-foreground text-xs">Город: {registration.city}</p>
                  <p className="text-muted-foreground text-xs">ID: {registration.id}</p>
                </div>

                <Button className="w-full" onClick={handleClose}>
                  Закрыть
                </Button>
              </div>
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
