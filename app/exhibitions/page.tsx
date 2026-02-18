'use client'

import { Header } from '@/components/layout/header'
import { ExhibitionCard } from '@/components/exhibitions/exhibition-card'
import { useAdmin } from '@/lib/admin-context'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X } from 'lucide-react'

export default function ExhibitionsPage() {
  const { exhibitions } = useAdmin()
  const publishedExhibitions = exhibitions.filter((e) => e.status === 'published')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('upcoming')

  const filteredExhibitions = publishedExhibitions
    .filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.location.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'upcoming') {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      }
      if (sortBy === 'popular') {
        return b.registrations - a.registrations
      }
      return 0
    })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="border-b border-border/40">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Выставки</h1>
          <p className="text-muted-foreground">Найдите и посетите интересующие вас выставки</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию или месту..."
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
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Ближайшие</SelectItem>
                <SelectItem value="popular">Популярные</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full bg-transparent">
              Дополнительные фильтры
            </Button>
          </div>

          {/* Results */}
          {filteredExhibitions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExhibitions.map((exhibition) => (
                <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Выставки не найдены</p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Очистить фильтры
              </Button>
            </div>
          )}

          {/* Stats */}
          <div className="mt-12 pt-8 border-t border-border/40">
            <p className="text-sm text-muted-foreground text-center">
              Найдено выставок: <span className="font-semibold text-foreground">{filteredExhibitions.length}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-muted/40 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <div className="font-bold text-lg mb-2">Myfair</div>
              <p className="text-sm text-muted-foreground">Платформа для управления выставками</p>
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
