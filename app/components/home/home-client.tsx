'use client'

import { ExhibitionCard } from '@/components/exhibitions/exhibition-card'
import { ExhibitionCardSkeleton } from '@/components/exhibitions/exhibition-card-skeleton'
import { NewsCard } from '@/components/news/news-card'
import { NewsCardSkeleton } from '@/components/news/news-card-skeleton'
import { Button } from '@/components/ui/button'
import { useAdmin } from '@/lib/admin-context'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function HomeClient() {
  const { user } = useAuth()
  const { exhibitions, news, isLoading } = useAdmin()
  const publishedExhibitions = exhibitions.filter((e) => e.status === 'published')
  const publishedNews = news.filter((n) => n.status === 'published')
  const featuredNews = publishedNews[0]
  const otherNews = publishedNews.slice(1)

  return (
    <>
      {/* Featured News - reserve min-height to reduce CLS */}
      {isLoading ? (
        <section className="border-b border-border/40 py-16 md:py-24 min-h-[340px]" aria-busy="true">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Последние новости</h2>
              <p className="text-muted-foreground mt-2">Узнайте о самых важных событиях в мире выставок</p>
            </div>
            <NewsCardSkeleton featured />
          </div>
        </section>
      ) : featuredNews ? (
        <section className="border-b border-border/40 py-16 md:py-24 min-h-[340px]">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Последние новости</h2>
              <p className="text-muted-foreground mt-2">Узнайте о самых важных событиях в мире выставок</p>
            </div>
            <NewsCard news={featuredNews} featured priority />
          </div>
        </section>
      ) : null}

      {/* Other News - reserve min-height */}
      {isLoading ? (
        <section className="border-b border-border/40 py-16 md:py-24 min-h-[380px]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <NewsCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      ) : otherNews.length > 0 ? (
        <section className="border-b border-border/40 py-16 md:py-24 min-h-[380px]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherNews.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Exhibitions - reserve min-height to reduce CLS */}
      <section className="py-16 md:py-24 min-h-[520px]" id="exhibitions">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-2">Выставки</h2>
            <p className="text-muted-foreground">Выберите интересующую вас выставку и зарегистрируйтесь</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[1, 2, 3].map((i) => (
                <ExhibitionCardSkeleton key={i} />
              ))}
            </div>
          ) : publishedExhibitions.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {publishedExhibitions.map((exhibition) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                ))}
              </div>
              <div className="text-center">
                <Button variant="outline" asChild>
                  <Link href="/exhibitions">
                    Все выставки
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Сейчас нет опубликованных выставок</p>
              {!user && (
                <Button asChild>
                  <Link href="/auth/signup">Быть в курсе</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="border-t border-border/40 bg-gradient-to-b from-primary/5 to-secondary/5 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Готовы начать?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Присоединяйтесь к тысячам пользователей, которые уже находят и создают отличные выставки
            </p>
            <Button size="lg" asChild>
              <Link href="/auth/signup">Зарегистрироваться сейчас</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <div className="font-bold text-lg mb-2">Myfair</div>
              <p className="text-sm text-muted-foreground">Платформа для управления выставками</p>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                О нас
              </Link>
              <Link href="/" className="hover:text-foreground transition-colors">
                Контакты
              </Link>
              <Link href="/" className="hover:text-foreground transition-colors">
                Политика конфиденциальности
              </Link>
            </div>
          </div>
          <div className="border-t border-border/40 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Myfair. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
