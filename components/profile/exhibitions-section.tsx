'use client'

import { useAuth } from '@/lib/auth-context'
import { useAdmin } from '@/lib/admin-context'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, QrCode } from 'lucide-react'
import Link from 'next/link'

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function ExhibitionsSection() {
  const { user } = useAuth()
  const { exhibitions, getRegistrationsByUser } = useAdmin()

  const userRegistrations = user ? getRegistrationsByUser(user.id) : []

  return (
    <div className="flex-1 flex justify-center items-center p-8">
      <div className="space-y-4 max-w-3xl w-full">
        {userRegistrations.length > 0 ? (
          userRegistrations.map((reg) => {
            const exhibition = exhibitions.find((e) => e.id === reg.exhibitionId)
            const startDate = exhibition?.startDate ? formatDate(exhibition.startDate) : null
            return (
              <Card key={reg.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{exhibition?.title ?? 'Выставка'}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{reg.city}</p>
                    </div>
                    <Badge variant={reg.status === 'registered' ? 'default' : 'outline'}>
                      {reg.status === 'registered' ? 'Зарегистрирован' : 'Отменён'}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    {startDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {startDate}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {exhibition?.location ?? reg.city}
                    </div>
                  </div>

                  {reg.status === 'registered' && reg.qrCode && (
                    <div className="rounded-lg border bg-muted/30 p-4 mb-4">
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={reg.qrCode}
                          alt="QR-код для входа"
                          className="w-44 h-44 object-contain"
                          loading="lazy"
                        />
                        <span className="text-xs font-mono text-muted-foreground">{reg.id}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
                        <QrCode className="w-4 h-4" />
                        Покажите QR-код на входе
                      </div>
                    </div>
                  )}

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/exhibitions/${reg.exhibitionId}`}>Подробнее о выставке</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground mb-4">Вы ещё не зарегистрированы ни на одну выставку</p>
              <Button asChild>
                <Link href="/exhibitions">Смотреть выставки</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
