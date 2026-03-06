'use client'

import { Header } from '@/components/layout/header'
import { ExhibitionCard } from '@/components/exhibitions/exhibition-card'
import { useAdmin } from '@/lib/admin-context'
import { useLocale } from '@/lib/i18n'
import { useState, useMemo, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination'
import { Search, X } from 'lucide-react'

const PER_PAGE = 10

export default function ExhibitionsPage() {
  const { t } = useLocale()
  const { exhibitions } = useAdmin()
  const publishedExhibitions = exhibitions.filter((e) => e.status === 'published')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('upcoming')
  const [page, setPage] = useState(1)

  const filteredExhibitions = useMemo(
    () =>
      publishedExhibitions
        .filter((e) => {
          const q = searchQuery.toLowerCase()
          const matchTitle = e.title.toLowerCase().includes(q)
          const matchCities = e.cities?.some((c) => {
            const o = typeof c === 'object' && c !== null ? c as { name?: string; nameUz?: string; nameRu?: string; nameEn?: string } : null
            const names = o ? [o.name, o.nameUz, o.nameRu, o.nameEn].filter(Boolean) : [String(c)]
            return names.some((n) => String(n).toLowerCase().includes(q))
          })
          return matchTitle || matchCities
        })
        .sort((a, b) => {
          if (sortBy === 'upcoming') {
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          }
          if (sortBy === 'popular') {
            return b.registrations - a.registrations
          }
          return 0
        }),
    [publishedExhibitions, searchQuery, sortBy]
  )

  const totalPages = Math.max(1, Math.ceil(filteredExhibitions.length / PER_PAGE))
  const start = (page - 1) * PER_PAGE
  const paginatedExhibitions = filteredExhibitions.slice(start, start + PER_PAGE)

  useEffect(() => {
    setPage(1)
  }, [searchQuery, sortBy])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <section className="border-b border-border/40 flex-shrink-0">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('exhibitions')}</h1>
          <p className="text-muted-foreground">{t('findAndVisitExhibitions')}</p>
        </div>
      </section>

      <section className="py-12 flex-1">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('searchByNameOrPlace')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder={t('sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">{t('sortNearest')}</SelectItem>
                <SelectItem value="popular">{t('sortPopular')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {filteredExhibitions.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedExhibitions.map((exhibition) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
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
              <p className="text-muted-foreground mb-4">{t('exhibitionsNotFound')}</p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                {t('clearFilters')}
              </Button>
            </div>
          )}

          {/* Stats */}
          <div className="mt-12 pt-8 border-t border-border/40">
            <p className="text-sm text-muted-foreground text-center">
              {t('foundExhibitionsCount')} <span className="font-semibold text-foreground">{filteredExhibitions.length}</span>
            </p>
          </div>
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
