'use client'

import { useState } from 'react'
import { Exhibition } from '@/lib/types'
import { getImageUrl } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RegistrationModal } from './registration-modal'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Users } from 'lucide-react'
import Image from 'next/image'

interface ExhibitionCardProps {
  exhibition: Exhibition
}

export function ExhibitionCard({ exhibition }: ExhibitionCardProps) {
  const [registrationOpen, setRegistrationOpen] = useState(false)
  const startDate = new Date(exhibition.startDate).toLocaleDateString('ru-RU', {
    month: 'short',
    day: 'numeric',
  })
  const endDate = new Date(exhibition.endDate).toLocaleDateString('ru-RU', {
    month: 'short',
    day: 'numeric',
  })

  const statusLabel = {
    draft: 'Черновик',
    published: 'Опубликовано',
    archived: 'Архив',
    cancelled: 'Отменено',
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="relative w-full h-48 bg-muted">
        {exhibition.image && (
          <Image
            src={getImageUrl(exhibition.image) || "/placeholder.svg"}
            alt={exhibition.title}
            fill
            className="object-cover"
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
            {exhibition.location}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            {exhibition.registrations} зарегистрировано
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild variant="outline" className="flex-1 bg-transparent">
            <Link href={`/exhibitions/${exhibition.id}`}>Подробнее</Link>
          </Button>
          <Button className="flex-1" onClick={() => setRegistrationOpen(true)}>
            Зарегистрироваться
          </Button>
        </div>

        <RegistrationModal
          isOpen={registrationOpen}
          onOpenChange={setRegistrationOpen}
          exhibitionId={exhibition.id}
          exhibitionTitle={exhibition.title}
        />
      </CardContent>
    </Card>
  )
}
