'use client'

import { use } from 'react'
import { Header } from '@/components/layout/header'
import { useAdmin } from '@/lib/admin-context'
import { getImageUrl } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { NewsDetailSkeleton } from '@/components/news/news-detail-skeleton'

interface NewsPageProps {
  params: Promise<{ id: string }>
}

export default function NewsDetailPage({ params }: NewsPageProps) {
  const { id } = use(params)
  const { news: newsList, isLoading } = useAdmin()
  const news = newsList.find((n) => n.id === id)
  const otherNews = newsList.filter((n) => n.id !== id && n.status === 'published').slice(0, 3)

  if (isLoading) {
    return <NewsDetailSkeleton />
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Новость не найдена</h1>
            <Button asChild>
              <Link href="/news">Вернуться к новостям</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const publishedDate = new Date(news.publishedAt).toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero — баннер */}
      <section className="relative w-full h-96 bg-muted">
        {(news.banner ?? news.image) && (
          <OptimizedImage
            src={getImageUrl(news.banner ?? news.image) || "/placeholder.svg"}
            alt={news.title}
            fill
            sizes="100vw"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto px-4">
            <Button variant="ghost" asChild className="mb-4 text-white hover:bg-white/20">
              <Link href="/news">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад к новостям
              </Link>
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{news.title}</h1>
            <Badge className="bg-violet-600 hover:bg-violet-700 text-white border-0">Новость</Badge>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main */}
            <article className="lg:col-span-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                <Calendar className="w-4 h-4" />
                {publishedDate}
              </div>

              {(news.images?.length ?? 0) > 0 && (
                <div className="mb-8 rounded-lg overflow-hidden border border-border/40">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-muted/30">
                    {(news.images ?? []).map((url, idx) => (
                      <div key={idx} className="relative aspect-video overflow-hidden rounded-md">
                        <OptimizedImage
                          src={getImageUrl(url) || '/placeholder.svg'}
                          alt={`${news.title} — ${idx + 1}`}
                          fill
                          sizes="(max-width: 640px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed">
                <p>{news.content}</p>
              </div>

              {/* Share — закомментировано
              <div className="mt-12 pt-8 border-t border-border/40">
                <p className="text-sm font-medium mb-4">Поделиться:</p>
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Twitter
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Facebook
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    LinkedIn
                  </Button>
                </div>
              </div>
              */}
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              {otherNews.length > 0 && (
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-lg">Другие новости</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {otherNews.map((n) => (
                      <Link
                        key={n.id}
                        href={`/news/${n.id}`}
                        className="block group p-3 rounded-lg border border-border/40 hover:border-primary/50 hover:bg-accent/5 transition-all"
                      >
                        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {n.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(n.publishedAt).toLocaleDateString('ru-RU', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}
            </aside>
          </div>
        </div>
      </section>

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
