'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useAdmin } from '@/lib/admin-context'
import { useLocale } from '@/lib/i18n'
import { getCityName, formatDateLocalized, getContentTitle } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, QrCode, MapPinned } from 'lucide-react'
import Link from 'next/link'
import { ChangeCityModal } from '@/components/exhibitions/change-city-modal'
import type { ExhibitionRegistration } from '@/lib/types'

export function ExhibitionsSection() {
  const { user } = useAuth()
  const { lang, t } = useLocale()
  const formatDate = (d: Date | string) => formatDateLocalized(d, lang, 'long')
  const { exhibitions, getRegistrationsByUser, refresh } = useAdmin()
  const [changeCityReg, setChangeCityReg] = useState<ExhibitionRegistration | null>(null)

  const isExhibitor = user?.role === 'exhibitor'
  const userRegistrations = !isExhibitor && user ? getRegistrationsByUser(user.id) : []
  const exhibitorExhibitions = isExhibitor && user
    ? exhibitions.filter((e) =>
        (e.participants ?? []).some((p) => {
          const id = typeof p === 'string' ? p : p.id
          return id === user.id
        }),
      )
    : []

  return (
    <div className="flex-1 flex justify-center items-center p-8">
      <div className="space-y-4 max-w-3xl w-full">
        {isExhibitor ? (
          exhibitorExhibitions.length > 0 ? (
            exhibitorExhibitions.map((exhibition) => (
              <Card key={exhibition.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{getContentTitle(exhibition, lang)}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('exhibitorParticipant')}: {user?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(exhibition.startDate)} — {formatDate(exhibition.endDate)}
                    </div>
                    {Array.isArray(exhibition.cities) && exhibition.cities.length > 0 && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {exhibition.cities.map((c) => getCityName(c, lang)).join(', ')}
                      </div>
                    )}
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/exhibitions/${exhibition.id}`}>{t('moreAboutExhibition')}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {t('exhibitorNoExhibitions')}
                </p>
              </CardContent>
            </Card>
          )
        ) : userRegistrations.length > 0 ? (
          userRegistrations.map((reg) => {
            const exhibition = exhibitions.find((e) => e.id === reg.exhibitionId)
            const startDate = exhibition?.startDate ? formatDate(exhibition.startDate) : null
            return (
              <Card key={reg.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{exhibition?.title ?? t('exhibitionFallback')}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{reg.city}</p>
                    </div>
                    <Badge variant={reg.status === 'registered' ? 'default' : 'outline'}>
                      {reg.status === 'registered' ? t('statusRegistered') : t('cancelledStatus')}
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
                      {exhibition?.cities?.length ? exhibition.cities.map((c) => getCityName(c, lang)).join(', ') : reg.city}
                    </div>
                  </div>

                  {reg.status === 'registered' && (
                    <Button variant="outline" size="sm" className="mb-4" onClick={() => setChangeCityReg(reg)}>
                      <MapPinned className="w-4 h-4 mr-2" />
                      Изменить город
                    </Button>
                  )}

                  {reg.status === 'registered' && reg.qrCode && (
                    <div className="rounded-lg border bg-muted/30 p-4 mb-4">
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={reg.qrCode}
                          alt={t('qrCodeForEntry')}
                          className="w-44 h-44 object-contain"
                          loading="lazy"
                        />
                        <span className="text-xs font-mono text-muted-foreground">{reg.id}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
                        <QrCode className="w-4 h-4" />
                        {t('showQrAtEntry')}
                      </div>
                    </div>
                  )}

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/exhibitions/${reg.exhibitionId}`}>{t('moreAboutExhibition')}</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })
        ) : null}
        {!isExhibitor && changeCityReg && (() => {
          const exhibition = exhibitions.find((e) => e.id === changeCityReg.exhibitionId)
          const cities = exhibition?.cities?.map((c) => getCityName(c, lang)) ?? []
          return (
            <ChangeCityModal
              isOpen={!!changeCityReg}
              onOpenChange={(open) => !open && setChangeCityReg(null)}
              registrationId={changeCityReg.id}
              currentCity={changeCityReg.city}
              cities={cities}
              onSuccess={() => {
                refresh()
                setChangeCityReg(null)
              }}
            />
          )
        })()}
        {!isExhibitor && userRegistrations.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground mb-4">{t('notRegisteredOnExhibitions')}</p>
              <Button asChild>
                <Link href="/exhibitions">{t('viewExhibitions')}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
