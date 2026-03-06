'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { NewsCard } from '@/components/news/news-card'
import { useAdmin } from '@/lib/admin-context'
import { useLocale } from '@/lib/i18n'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination'

const PER_PAGE = 10

export default function NewsPage() {
  const { t } = useLocale()
  const { news } = useAdmin()
  const publishedNews = news.filter((n) => n.status === 'published')
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(publishedNews.length / PER_PAGE))
  const start = (page - 1) * PER_PAGE
  const paginatedNews = publishedNews.slice(start, start + PER_PAGE)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <section className="border-b border-border/40 flex-shrink-0">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('news')}</h1>
          <p className="text-muted-foreground">{t('newsSubtitle')}</p>
        </div>
      </section>

      <section className="py-12 flex-1">
        <div className="container mx-auto px-4">
          {publishedNews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedNews.map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
              {totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setPage((p) => Math.max(1, p - 1))
                        }}
                        className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setPage(p)
                          }}
                          isActive={page === p}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setPage((p) => Math.min(totalPages, p + 1))
                        }}
                        className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('noNewsYet')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-muted/40 mt-auto flex-shrink-0">
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
