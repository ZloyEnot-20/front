'use client'

import { use, useState } from 'react'
import { Header } from '@/components/layout/header'
import { useAdmin } from '@/lib/admin-context'
import { getImageUrl } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { RegistrationModal } from '@/components/exhibitions/registration-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Users } from 'lucide-react'
import { OptimizedImage } from '@/components/ui/optimized-image'

interface ExhibitionPageProps {
  params: Promise<{ id: string }>
}

export default function ExhibitionPage({ params }: ExhibitionPageProps) {
  const { id } = use(params)
  const [registrationOpen, setRegistrationOpen] = useState(false)
  const { user } = useAuth()
  const { exhibitions, getRegistrationsByUser } = useAdmin()
  const exhibition = exhibitions.find((e) => e.id === id)
  const userRegistrations = user ? getRegistrationsByUser(user.id) : []
  const isRegistered = userRegistrations.some((r) => r.exhibitionId === id && r.status === 'registered')
  const participants: { id: string; exhibitionId: string; userId: string; companyName: string; boothNumber?: string; status: string }[] = []

  if (!exhibition) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Выставка не найдена</h1>
            <Button asChild>
              <Link href="/exhibitions">Вернуться к выставкам</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const startDate = new Date(exhibition.startDate).toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const endDate = new Date(exhibition.endDate).toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const statusLabel = {
    draft: 'Черновик',
    published: 'Опубликовано',
    archived: 'Архив',
    cancelled: 'Отменено',
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative w-full h-96 bg-muted">
        {exhibition.image && (
          <OptimizedImage
            src={getImageUrl(exhibition.image) || "/placeholder.svg"}
            alt={exhibition.title}
            fill
            sizes="100vw"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto px-4">
            <Button variant="ghost" asChild className="mb-4 text-white hover:bg-white/20">
              <Link href="/exhibitions">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Link>
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{exhibition.title}</h1>
            <Badge variant="secondary">{statusLabel[exhibition.status]}</Badge>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>О выставке</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed">{exhibition.description}</p>
                </CardContent>
              </Card>

              {/* Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Даты проведения</p>
                      <p className="text-sm text-muted-foreground">
                        {startDate} - {endDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Место проведения</p>
                      <p className="text-sm text-muted-foreground">{exhibition.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Участники</p>
                      <p className="text-sm text-muted-foreground">{exhibition.participantCount} участников</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Зарегистрировано</p>
                      <p className="text-sm text-muted-foreground">{exhibition.registrations} участников</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participants */}
              {participants.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Компании-участники</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {participants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between p-4 border border-border/40 rounded-lg">
                          <div>
                            <p className="font-medium">{participant.companyName}</p>
                            {participant.boothNumber && (
                              <p className="text-sm text-muted-foreground">Стенд: {participant.boothNumber}</p>
                            )}
                          </div>
                          <Badge variant={participant.status === 'confirmed' ? 'default' : 'outline'}>
                            {participant.status === 'confirmed' ? 'Подтверждено' : 'Зарегистрировано'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            {!isRegistered && (
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Регистрация</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {user
                        ? 'Выберите город — данные из профиля будут отправлены автоматически.'
                        : 'Войдите в аккаунт для регистрации на выставку.'}
                    </p>
                    <Button className="w-full" onClick={() => setRegistrationOpen(true)}>
                      {user ? 'Зарегистрироваться' : 'Войти и зарегистрироваться'}
                    </Button>
                    {user && (
                      <p className="text-xs text-muted-foreground text-center">
                        Только выбор города — без заполнения форм
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            {isRegistered && (
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Регистрация</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Вы уже зарегистрированы на эту выставку.
                    </p>
                    <Button variant="secondary" className="w-full" disabled>
                      Вы уже зареганы
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={registrationOpen}
        onOpenChange={setRegistrationOpen}
        exhibitionId={exhibition.id}
        exhibitionTitle={exhibition.title}
      />

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-muted/40 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <div className="font-bold text-lg mb-2">Myfair</div>
              <p className="text-sm text-muted-foreground">Платформа для управления выставками</p>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                О нас
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Контакты
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Политика конфиденциальности
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
