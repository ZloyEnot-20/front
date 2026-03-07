import { News } from '@/lib/types'
import { getImageUrl } from '@/lib/api'
import { useLocale } from '@/lib/i18n'
import { formatDateLocalized, getContentTitle, getNewsContent } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { OptimizedImage } from '@/components/ui/optimized-image'

interface NewsCardProps {
  news: News
  featured?: boolean
  priority?: boolean
}

export function NewsCard({ news, featured = false, priority = false }: NewsCardProps) {
  const { lang } = useLocale()
  const publishedDate = formatDateLocalized(news.publishedAt, lang, 'long')

  if (featured) {
    return (
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative w-full h-80 bg-muted">
            {news.image && (
              <OptimizedImage
                src={getImageUrl(news.image) || "/placeholder.svg"}
                alt={getContentTitle(news, lang)}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={priority}
              />
            )}
          </div>
          <div className="flex flex-col justify-center p-6">
            <CardTitle className="text-2xl mb-2">{getContentTitle(news, lang)}</CardTitle>
            <CardDescription className="text-base mb-4 line-clamp-3">{(getNewsContent(news, lang) ?? '').replace(/<[^>]*>/g, '').trim().slice(0, 200)}{(getNewsContent(news, lang) ?? '').length > 200 ? '…' : ''}</CardDescription>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Calendar className="w-4 h-4" />
              {publishedDate}
            </div>
            <Button asChild className="w-fit">
              <Link href={`/news/${news.id}`}>Читать полностью</Link>
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="relative w-full h-40 bg-muted">
        {news.image && (
          <OptimizedImage
            src={getImageUrl(news.image) || "/placeholder.svg"}
            alt={getContentTitle(news, lang)}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
      </div>

      <CardHeader className="flex-1">
        <CardTitle className="line-clamp-2">{getContentTitle(news, lang)}</CardTitle>
        <CardDescription className="line-clamp-2">{(getNewsContent(news, lang) ?? '').replace(/<[^>]*>/g, '').trim().slice(0, 120)}{(getNewsContent(news, lang) ?? '').length > 120 ? '…' : ''}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {publishedDate}
        </div>

        <Button asChild className="w-full bg-transparent" variant="outline">
          <Link href={`/news/${news.id}`}>Читать</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
