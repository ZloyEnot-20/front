'use client'

import { ExhibitionCard } from '@/components/exhibitions/exhibition-card'
import { ExhibitionCardSkeleton } from '@/components/exhibitions/exhibition-card-skeleton'
import { NewsCard } from '@/components/news/news-card'
import { NewsCardSkeleton } from '@/components/news/news-card-skeleton'
import { Button } from '@/components/ui/button'
import { useAdmin } from '@/lib/admin-context'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const HOME_EXHIBITIONS_LIMIT = 6
const HOME_NEWS_LIMIT = 6

export function HomeClient() {
  const { t } = useLocale()
  const { user } = useAuth()
  const { exhibitions, news, isLoading } = useAdmin()
  const publishedExhibitions = exhibitions.filter((e) => e.status === 'published')
  const publishedNews = news.filter((n) => n.status === 'published')

  return (
    <>
      {/* Exhibitions — выше, акцент на выставках */}
      <section className="border-t border-b border-border/40 py-16 md:py-24 min-h-[520px]" id="exhibitions">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-2">{t('exhibitions')}</h2>
            <p className="text-muted-foreground">{t('exhibitionsSubtitle')}</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[1, 2, 3].map((i) => (
                <ExhibitionCardSkeleton key={i} />
              ))}
            </div>
          ) : publishedExhibitions.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {publishedExhibitions.slice(0, HOME_EXHIBITIONS_LIMIT).map((exhibition) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} showExhibitionBadge />
                ))}
              </div>
              <div className="text-center">
                <Button variant="outline" asChild>
                  <Link href="/exhibitions">
                    {t('allExhibitions')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">{t('noExhibitionsNow')}</p>
              {!user && (
                <Button asChild>
                  <Link href="/auth/signup">{t('stayTuned')}</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Новости — 2 ряда по 3 */}
      <section className="border-t border-b border-border/40 py-16 md:py-24 min-h-[380px]" id="news">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">{t('latestNews')}</h2>
            <p className="text-muted-foreground mt-2">{t('latestNewsDesc')}</p>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <NewsCardSkeleton key={i} />
              ))}
            </div>
          ) : publishedNews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {publishedNews.slice(0, HOME_NEWS_LIMIT).map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
              <div className="text-center">
                <Button variant="outline" asChild>
                  <Link href="/news">
                    {t('allNews')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-center py-8">{t('noNews')}</p>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="border-t border-border/40 bg-gradient-to-b from-primary/5 to-secondary/5 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('readyToStart')}</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('ctaSubtitle')}
            </p>
            <Button size="lg" asChild>
              <Link href="/auth/signup">{t('registerNowCta')}</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-muted/40">
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
              <Link href="/" className="hover:text-foreground transition-colors">
                {t('aboutUs')}
              </Link>
              <Link href="/" className="hover:text-foreground transition-colors">
                {t('contacts')}
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                {t('privacyPolicy')}
              </Link>
            </div>
          </div>
          <div className="border-t border-border/40 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 {t('appName')}. {t('allRightsReserved')}.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
