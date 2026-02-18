'use client'

import { useAuth } from '@/lib/auth-context'
import { useAdmin } from '@/lib/admin-context'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'

export function ExhibitionsSection() {
  const { user } = useAuth()
  const { exhibitions, getRegistrationsByUser } = useAdmin()

  const userRegistrations = user ? getRegistrationsByUser(user.id) : []

  return (
    <div className="flex-1 flex justify-center items-center p-8">
      {/* <h1 className="text-3xl font-bold mb-8">Мои выставки</h1> */}

      <div className="space-y-4 max-w-3xl w-full">
        {userRegistrations.length > 0 ? (
          userRegistrations.map((reg) => {
            const exhibition = exhibitions.find((e) => e.id === reg.exhibitionId)
            return (
              <Card key={reg.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{exhibition?.title ?? 'Выставка'}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{reg.city}</p>
                    </div>
                    <Badge variant={reg.status === 'registered' ? 'default' : 'outline'}>
                      {reg.status === 'registered' ? 'Зарегистрирован' : 'Отменён'}
                    </Badge>
                  </div>

                  <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {exhibition?.location ?? reg.city}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(reg.registeredAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>

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
