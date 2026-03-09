'use client'

import { use, useState } from 'react'
import { Header } from '@/components/layout/header'
import { useAdmin } from '@/lib/admin-context'
import { getImageUrl } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'
import { getCityName, getVenue, formatDateLocalized, getContentTitle, getContentDescription } from '@/lib/utils'
import { RegistrationModal } from '@/components/exhibitions/registration-modal'
import { ChangeCityModal } from '@/components/exhibitions/change-city-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Users, ExternalLink, Building2, X } from 'lucide-react'
import { ExhibitorModal } from '@/components/exhibitions/exhibitor-modal'
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
  const { lang, t } = useLocale()
  const { exhibitions, getRegistrationsByUser, isLoading, refresh } = useAdmin()
  const exhibition = exhibitions.find((e) => e.id === id)
  const userRegistrations = user ? getRegistrationsByUser(user.id) : []
  const currentRegistration = userRegistrations.find((r) => r.exhibitionId === id && r.status === 'registered')
  const isRegistered = !!currentRegistration
  const participants = exhibition?.participants ?? []
  const exhibitionCities = exhibition?.cities?.map((c) => getCityName(c, lang)) ?? []
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
            <h1 className="text-2xl font-bold mb-4">{t('exhibitionNotFound')}</h1>
            <Button asChild>
              <Link href="/exhibitions">{t('backToExhibitions')}</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const startDate = formatDateLocalized(exhibition.startDate, lang, 'full')
  const endDate = formatDateLocalized(exhibition.endDate, lang, 'full')

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero — баннер без кнопки назад */}
      <section className="relative w-full h-96 bg-muted">
        {(exhibition.banner ?? exhibition.image) && (
          <OptimizedImage
            src={getImageUrl(exhibition.banner ?? exhibition.image) || "/placeholder.svg"}
            alt={getContentTitle(exhibition, lang)}
            fill
            sizes="100vw"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{getContentTitle(exhibition, lang)}</h1>
            <Badge className="bg-violet-600 hover:bg-violet-700 text-white border-0">{t('exhibitionBadge')}</Badge>
          </div>
        </div>
      </section>

      {/* Под беджем: кнопка назад */}
      <div className="container mx-auto px-4 pt-4">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2" asChild>
          <Link href="/exhibitions">
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
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
                  <CardTitle>{t('aboutExhibition')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed">{getContentDescription(exhibition, lang)}</p>
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
                        alt={`${getContentTitle(exhibition, lang)} — ${idx + 1}`}
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
                  <CardTitle>{t('info')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{t('datesHeld')}</p>
                      <p className="text-sm text-muted-foreground">
                        {startDate} - {endDate}
                      </p>
                    </div>
                  </div>

                  {(getVenue(exhibition, lang) || (exhibition.cities?.length ?? 0) > 0) && (
                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{t('venueLabel')}</p>
                        <p className="text-sm text-muted-foreground">
                          {[getVenue(exhibition, lang), exhibition.cities?.map((c) => getCityName(c, lang)).join(', ')].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {user?.role !== 'visitor' && user?.role !== 'exhibitor' && (
                    <div className="flex items-start gap-4">
                      <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{t('registeredLabel')}</p>
                        <p className="text-sm text-muted-foreground">{exhibition.registrations} {t('visitorsCount')}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Participants (университеты) */}
              {participants.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('participantsLabel')}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t('universitiesOfExhibition')}</p>
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
                    <CardTitle>{t('registrationTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {user
                        ? t('chooseCityForVisit')
                        : t('signInToRegister')}
                    </p>
                    <Button className="w-full" onClick={() => setRegistrationOpen(true)}>
                      {user ? t('submitRegistration') : t('signInAndRegister')}
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
                    <CardTitle>{t('registrationTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentRegistration && (
                      <p className="text-sm text-muted-foreground">
                        {t('city')}: <strong>{currentRegistration.city}</strong>
                      </p>
                    )}
                    <p className="text-sm font-medium text-green-600">
                      {t('youAreRegisteredOnExhibition')}
                    </p>
                    {canChangeCity && currentRegistration && (
                      <Button variant="outline" className="w-full" onClick={() => setChangeCityOpen(true)}>
                        {t('changeCity')}
                      </Button>
                    )}
                    <Button variant="default" className="w-full" asChild>
                      <Link href="/profile?tab=exhibitions">{t('goToProfile')}</Link>
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
        exhibitionTitle={getContentTitle(exhibition, lang)}
        cities={exhibitionCities}
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
                aria-label={t('close')}
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

      <ExhibitorModal exhibitor={exhibitorModal} open={!!exhibitorModal} onOpenChange={(open) => !open && setExhibitorModal(null)} />

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-muted/40 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="" className="w-10 h-10 rounded-lg object-contain shrink-0" />
              <div>
                <div className="font-bold text-lg mb-0.5">{t('appName')}</div>
                <p className="text-sm text-muted-foreground">{t('platformSubtitle')}</p>
              </div>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                {t('aboutUs')}
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                {t('contacts')}
              </a>
              <a href="/privacy" className="hover:text-foreground transition-colors">
                {t('privacyPolicy')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
