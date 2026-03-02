'use client'

import { useState } from 'react'
import { Exhibition } from '@/lib/types'
import { getImageUrl } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useAdmin } from '@/lib/admin-context'
import { useLocale } from '@/lib/i18n'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RegistrationModal } from './registration-modal'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Users, CheckCircle2 } from 'lucide-react'
import { OptimizedImage } from '@/components/ui/optimized-image'

interface ExhibitionCardProps {
  exhibition: Exhibition
}

export function ExhibitionCard({ exhibition }: ExhibitionCardProps) {
  const { t, lang } = useLocale()
  const [registrationOpen, setRegistrationOpen] = useState(false)
  const { user } = useAuth()
  const { getRegistrationsByUser } = useAdmin()
  const userRegistrations = user ? getRegistrationsByUser(user.id) : []
  const isRegistered = userRegistrations.some((r) => r.exhibitionId === exhibition.id && r.status === 'registered')
  const canRegister = !user || user.role === 'admin' || user.role === 'visitor'
  const locale = lang === 'uz' ? 'uz-UZ' : lang === 'en' ? 'en-US' : 'ru-RU'
  const startDate = new Date(exhibition.startDate).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  })
  const endDate = new Date(exhibition.endDate).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  })

  const statusLabel = {
    draft: t('draft'),
    published: t('published'),
    archived: t('archived'),
    cancelled: t('cancelled'),
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="relative w-full h-48 bg-muted">
        {exhibition.image && (
          <OptimizedImage
            src={getImageUrl(exhibition.image) || "/placeholder.svg"}
            alt={exhibition.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        <Badge className="absolute top-4 left-4" variant={exhibition.status === 'published' ? 'default' : 'secondary'}>
          {statusLabel[exhibition.status]}
        </Badge>
      </div>

      <CardHeader className="flex-1">
        <CardTitle className="line-clamp-2">{exhibition.title}</CardTitle>
        <CardDescription className="line-clamp-2">{exhibition.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {startDate} - {endDate}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {exhibition.cities?.length ? exhibition.cities.map((c) => c.name).join(', ') : ''}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            {exhibition.registrations} {t('registeredCount')}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild variant="outline" className="flex-1 bg-transparent">
            <Link href={`/exhibitions/${exhibition.id}`}>{t('moreDetails')}</Link>
          </Button>
          {isRegistered ? (
            <div className="flex flex-col items-center justify-center gap-2 py-1 flex-1">
              <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <p className="text-sm font-medium text-green-600">{t('youAreRegistered')}</p>
              </div>
            </div>
          ) : canRegister ? (
            <Button className="flex-1" onClick={() => setRegistrationOpen(true)}>
              {t('registerToExhibition')}
            </Button>
          ) : null}
        </div>

        <RegistrationModal
          isOpen={registrationOpen}
          onOpenChange={setRegistrationOpen}
          exhibitionId={exhibition.id}
          exhibitionTitle={exhibition.title}
          cities={exhibition.cities?.map((c) => c.name) ?? []}
        />
      </CardContent>
    </Card>
  )
}
