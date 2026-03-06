'use client'

import { use, useState } from 'react'
import { Header } from '@/components/layout/header'
import { useAdmin } from '@/lib/admin-context'
import { getImageUrl } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { RegistrationModal } from '@/components/exhibitions/registration-modal'
import { ChangeCityModal } from '@/components/exhibitions/change-city-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Users, ExternalLink, Building2, X } from 'lucide-react'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { ExhibitionDetailSkeleton } from '@/components/exhibitions/exhibition-detail-skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { ExhibitorInfo } from '@/lib/types'

interface ExhibitionPageProps {
  params: Promise<{ id: string }>
}

export default function ExhibitionPage({ params }: ExhibitionPageProps) {
  const { id } = use(params)
  const [registrationOpen, setRegistrationOpen] = useState(false)
  const [changeCityOpen, setChangeCityOpen] = useState(false)
  const [exhibitorModal, setExhibitorModal] = useState<ExhibitorInfo | null>(null)
  const [galleryImageModal, setGalleryImageModal] = useState<string | null>(null)
  const { user } = useAuth()
  const { exhibitions, getRegistrationsByUser, isLoading, refresh } = useAdmin()
  const exhibition = exhibitions.find((e) => e.id === id)
  const userRegistrations = user ? getRegistrationsByUser(user.id) : []
  const currentRegistration = userRegistrations.find((r) => r.exhibitionId === id && r.status === 'registered')
  const isRegistered = !!currentRegistration
  const participants = exhibition?.participants ?? []
  const exhibitionCities = exhibition?.cities?.map((c) => c.name) ?? []
  const canChangeCity = isRegistered && exhibitionCities.length >= 1

  if (isLoading) {
    return <ExhibitionDetailSkeleton />
  }

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero — баннер без кнопки назад */}
      <section className="relative w-full h-96 bg-muted">
        {(exhibition.banner ?? exhibition.image) && (
          <OptimizedImage
            src={getImageUrl(exhibition.banner ?? exhibition.image) || "/placeholder.svg"}
            alt={exhibition.title}
            fill
            sizes="100vw"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{exhibition.title}</h1>
            <Badge className="bg-violet-600 hover:bg-violet-700 text-white border-0">Выставка</Badge>
          </div>
        </div>
      </section>

      {/* Под беджем: кнопка назад */}
      <div className="container mx-auto px-4 pt-4">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2" asChild>
          <Link href="/exhibitions">
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Link>
        </Button>
      </div>

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

              {/* Галерея: 3 в ряд, небольшие превью, по клику — модалка */}
              {(exhibition.images?.length ?? 0) > 0 && (
                <div className="grid grid-cols-3 gap-2 max-w-sm">
                  {(exhibition.images ?? []).map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="relative aspect-square overflow-hidden rounded-lg border border-border/40 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      onClick={() => setGalleryImageModal(getImageUrl(url) || url)}
                    >
                      <OptimizedImage
                        src={getImageUrl(url) || '/placeholder.svg'}
                        alt={`${exhibition.title} — ${idx + 1}`}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

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

                  {(exhibition.cities?.length ?? 0) > 0 && (
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-medium">Города</p>
                        <p className="text-sm text-muted-foreground">{exhibition.cities?.map((c) => c.name).join(', ') ?? ''}</p>
                  </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Зарегистрировано</p>
                      <p className="text-sm text-muted-foreground">{exhibition.registrations} посетителей</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participants (университеты) */}
              {participants.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Участники</CardTitle>
                    <p className="text-sm text-muted-foreground">Университеты выставки</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {participants.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setExhibitorModal(p)}
                          className="flex items-center gap-4 p-4 rounded-lg border border-border/40 hover:border-primary/50 hover:bg-muted/30 transition-colors text-left"
                        >
                          <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                            {p.avatar ? (
                              <img src={getImageUrl(p.avatar)} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{p.name}</p>
                            {p.exhibitorDescription && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{p.exhibitorDescription}</p>
                            )}
                        </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar: регистрация только для гостей, admin и visitor */}
            {!isRegistered && (() => {
              const canRegister = !user || user.role === 'admin' || user.role === 'visitor'
              if (!canRegister) return null
              return (
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Регистрация</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {user
                        ? 'Выберите город для посещения выставки.'
                        : 'Войдите в аккаунт для регистрации на выставку.'}
                    </p>
                    <Button className="w-full" onClick={() => setRegistrationOpen(true)}>
                      {user ? 'Зарегистрироваться' : 'Войти и зарегистрироваться'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
              )
            })()}
            {isRegistered && (
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Регистрация</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentRegistration && (
                      <p className="text-sm text-muted-foreground">
                        Город: <strong>{currentRegistration.city}</strong>
                      </p>
                    )}
                    <p className="text-sm font-medium text-green-600">
                      Вы зарегистрированы на эту выставку. QR-код для входа доступен в разделе «Мои выставки» в профиле.
                    </p>
                    {canChangeCity && currentRegistration && (
                      <Button variant="outline" className="w-full" onClick={() => setChangeCityOpen(true)}>
                        Изменить город
                      </Button>
                    )}
                    <Button variant="default" className="w-full" asChild>
                      <Link href="/profile?tab=exhibitions">Перейти в профиль</Link>
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
        cities={exhibition.cities?.map((c) => c.name) ?? []}
      />

      {/* Change city modal */}
      {currentRegistration && (
        <ChangeCityModal
          isOpen={changeCityOpen}
          onOpenChange={setChangeCityOpen}
          registrationId={currentRegistration.id}
          currentCity={currentRegistration.city}
          cities={exhibitionCities}
          onSuccess={refresh}
        />
      )}

      {/* Галерея: модалка по клику на картинку */}
      <Dialog open={!!galleryImageModal} onOpenChange={(open) => !open && setGalleryImageModal(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-white">
          {galleryImageModal && (
            <>
              <button
                type="button"
                className="absolute top-2 right-2 z-10 rounded-full p-1.5 text-foreground/80 hover:text-foreground hover:bg-muted focus:outline-none"
                onClick={() => setGalleryImageModal(null)}
                aria-label="Закрыть"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="relative w-full min-h-[50vh] flex items-center justify-center p-4">
                <img
                  src={galleryImageModal}
                  alt=""
                  className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Exhibitor detail modal */}
      <Dialog open={!!exhibitorModal} onOpenChange={(open) => !open && setExhibitorModal(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {exhibitorModal && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {exhibitorModal.avatar ? (
                      <img src={getImageUrl(exhibitorModal.avatar)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  {exhibitorModal.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {exhibitorModal.exhibitorDescription && (
                  <p className="text-sm text-foreground/80 leading-relaxed">{exhibitorModal.exhibitorDescription}</p>
                )}
                {exhibitorModal.exhibitorAddress && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{exhibitorModal.exhibitorAddress}</p>
                  </div>
                )}
                {exhibitorModal.exhibitorWebsite && (
                  <a
                    href={exhibitorModal.exhibitorWebsite.startsWith('http') ? exhibitorModal.exhibitorWebsite : `https://${exhibitorModal.exhibitorWebsite}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {exhibitorModal.exhibitorWebsite}
                  </a>
                )}
                {exhibitorModal.exhibitorPhotos && exhibitorModal.exhibitorPhotos.length > 0 && (
                  <div className="relative w-full">
                    <Carousel opts={{ align: 'start', loop: exhibitorModal.exhibitorPhotos.length > 1, containScroll: 'trimSnaps' }} className="w-full">
                      <CarouselContent className="-ml-2">
                        {exhibitorModal.exhibitorPhotos.map((url, i) => (
                          <CarouselItem key={i} className="pl-2 basis-1/3">
                            <img
                              src={getImageUrl(url) || url}
                              alt=""
                              className="rounded-lg object-cover aspect-square w-full"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {exhibitorModal.exhibitorPhotos.length > 1 && (
                        <>
                          <CarouselPrevious className="left-2 border-0 bg-black/50 text-white hover:bg-black/70 disabled:opacity-30" />
                          <CarouselNext className="right-2 border-0 bg-black/50 text-white hover:bg-black/70 disabled:opacity-30" />
                        </>
                      )}
                    </Carousel>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-muted/40 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <div className="font-bold text-lg mb-2">EDU Expo</div>
              <p className="text-sm text-muted-foreground">Платформа для организации выставок</p>
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
