'use client'

import { Header } from '@/components/layout/header'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/lib/auth-context'
import { useAdmin } from '@/lib/admin-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExhibitionCard } from '@/components/exhibitions/exhibition-card'
import { Badge } from '@/components/ui/badge'
import { Users, TrendingUp, Calendar, Download, QrCode } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function ParticipantContent() {
  const { user } = useAuth()
  const { exhibitions, registrations } = useAdmin()

  if (!user) {
    return <div>Загрузка...</div>
  }

  const myRegistrations = registrations.filter((r) => r.userId === user.id)
  const participatedExhibitionIds = new Set(myRegistrations.map((r) => r.exhibitionId))
  const participatedExhibitions = exhibitions.filter((e) => participatedExhibitionIds.has(e.id))

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="border-b border-border/40">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold">Кабинет участника</h1>
          <p className="text-muted-foreground mt-2">Управляйте участием в выставках</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Выставок</p>
                    <p className="text-2xl font-bold">{participatedExhibitions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Подтверждено</p>
                    <p className="text-2xl font-bold">
                      {myRegistrations.filter((r) => r.status === 'registered').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Предстоящих</p>
                    <p className="text-2xl font-bold">
                      {participatedExhibitions.filter((e) => new Date(e.startDate) > new Date()).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="registered" className="max-w-4xl">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="registered">Мои выставки (QR)</TabsTrigger>
              <TabsTrigger value="all">Все выставки</TabsTrigger>
              <TabsTrigger value="upcoming">Предстоящие</TabsTrigger>
              <TabsTrigger value="past">Прошедшие</TabsTrigger>
            </TabsList>

            {/* My Registrations with QR Code */}
            <TabsContent value="registered" className="space-y-6 mt-6">
              {myRegistrations.length > 0 ? (
                <div className="space-y-4">
                  {myRegistrations.map((registration) => {
                    const exhibition = exhibitions.find((e) => e.id === registration.exhibitionId)
                    return (
                      <Card key={registration.id}>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                              <h3 className="font-semibold">{exhibition?.title}</h3>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <p>Имя: {registration.firstName} {registration.lastName}</p>
                                <p>Email: {registration.email}</p>
                                <p>Телефон: {registration.phone}</p>
                                <p>Город: {registration.city}</p>
                              </div>
                              <Badge variant="outline" className="w-fit">
                                Зарегистрирован
                              </Badge>
                            </div>
                            <div className="flex justify-center items-center">
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <Image
                                  src={registration.qrCode || "/placeholder.svg"}
                                  alt="QR Code"
                                  width={200}
                                  height={200}
                                  className="w-40 h-40"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 justify-center">
                              <Button variant="outline" className="gap-2 bg-transparent">
                                <Download className="w-4 h-4" />
                                Скачать QR
                              </Button>
                              <Button variant="outline" className="gap-2 bg-transparent">
                                <QrCode className="w-4 h-4" />
                                Показать на экране
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <QrCode className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <p className="text-muted-foreground mb-4">Вы еще не зарегистрированы на выставки</p>
                      <Button asChild>
                        <Link href="/exhibitions">Зарегистрироваться на выставку</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* All Exhibitions */}
            <TabsContent value="all" className="space-y-6 mt-6">
              {participatedExhibitions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {participatedExhibitions.map((exhibition) => (
                    <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">Вы еще не участвуете в выставках</p>
                      <Button asChild>
                        <Link href="/exhibitions">Найти выставку</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Upcoming */}
            <TabsContent value="upcoming" className="space-y-6 mt-6">
              {participatedExhibitions.filter((e) => new Date(e.startDate) > new Date()).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {participatedExhibitions
                    .filter((e) => new Date(e.startDate) > new Date())
                    .map((exhibition) => (
                      <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                    ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Нет предстоящих выставок</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Past */}
            <TabsContent value="past" className="space-y-6 mt-6">
              {participatedExhibitions.filter((e) => new Date(e.endDate) <= new Date()).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {participatedExhibitions
                    .filter((e) => new Date(e.endDate) <= new Date())
                    .map((exhibition) => (
                      <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                    ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Нет прошедших выставок</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}

export default function ParticipantPage() {
  return (
    <ProtectedRoute requiredRoles={['participant']}>
      <ParticipantContent />
    </ProtectedRoute>
  )
}
