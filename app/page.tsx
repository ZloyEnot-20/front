'use client'

import { Header } from '@/components/layout/header'
import { ExhibitionCard } from '@/components/exhibitions/exhibition-card'
import { NewsCard } from '@/components/news/news-card'
import { Button } from '@/components/ui/button'
import { useAdmin } from '@/lib/admin-context'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  const { exhibitions, news, isLoading } = useAdmin()
  const publishedExhibitions = exhibitions.filter((e) => e.status === 'published')
  const publishedNews = news.filter((n) => n.status === 'published')
  const featuredNews = publishedNews[0]
  const otherNews = publishedNews.slice(1)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="border-b border-border/40">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
              Открывайте миры <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">новых возможностей</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-balance">
              Найдите и посетите лучшие выставки, встречайте единомышленников и развивайте свой бизнес на ведущих платформах для нетворкинга.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="#exhibitions">
                  Смотреть выставки
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/signup">Зарегистрироваться</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured News */}
      {!isLoading && featuredNews && (
        <section className="border-b border-border/40 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Последние новости</h2>
              <p className="text-muted-foreground mt-2">Узнайте о самых важных событиях в мире выставок</p>
            </div>
            <NewsCard news={featuredNews} featured />
          </div>
        </section>
      )}

      {/* Other News */}
      {!isLoading && otherNews.length > 0 && (
        <section className="border-b border-border/40 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherNews.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Exhibitions */}
      <section className="py-16 md:py-24" id="exhibitions">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-2">Выставки</h2>
            <p className="text-muted-foreground">Выберите интересующую вас выставку и зарегистрируйтесь</p>
          </div>

          {!isLoading && publishedExhibitions.length > 0 ? (
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
          ) : !isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Сейчас нет опубликованных выставок</p>
              <Button asChild>
                <Link href="/auth/signup">Быть в курсе</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </section>

      {/* CTA Section */}
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
            <p>&copy; 2024 Myfair. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
