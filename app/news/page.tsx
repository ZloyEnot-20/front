'use client'

import { Header } from '@/components/layout/header'
import { NewsCard } from '@/components/news/news-card'
import { useAdmin } from '@/lib/admin-context'

export default function NewsPage() {
  const { news } = useAdmin()
  const publishedNews = news.filter((n) => n.status === 'published')
  const featuredNews = publishedNews[0]
  const otherNews = publishedNews.slice(1)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <section className="border-b border-border/40 flex-shrink-0">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Новости</h1>
          <p className="text-muted-foreground">Будьте в курсе последних событий в мире выставок</p>
        </div>
      </section>

      <section className="py-12 flex-1">
        <div className="container mx-auto px-4">
          {/* Featured */}
          {featuredNews && (
            <div className="mb-16">
              <NewsCard news={featuredNews} featured />
            </div>
          )}

          {/* Grid */}
          {otherNews.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-8">Другие новости</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherNews.map((news) => (
                  <NewsCard key={news.id} news={news} />
                ))}
              </div>
            </div>
          )}

          {publishedNews.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Новостей пока нет</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-muted/40 mt-auto flex-shrink-0">
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
