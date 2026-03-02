'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { citiesApi, ApiCity } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Loader2, Trash2, MapPin } from 'lucide-react'

function ReferenceContent() {
  const [cities, setCities] = useState<ApiCity[]>([])
  const [citiesLoading, setCitiesLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [newCityName, setNewCityName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadCities = async () => {
    setCitiesLoading(true)
    try {
      const list = await citiesApi.list()
      setCities(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки городов')
    } finally {
      setCitiesLoading(false)
    }
  }

  useEffect(() => {
    loadCities()
  }, [])

  const handleCreateCity = async () => {
    const name = newCityName.trim()
    if (!name) return
    setSaving(true)
    setError(null)
    try {
      await citiesApi.create({ name })
      setNewCityName('')
      setModalOpen(false)
      await loadCities()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка создания')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCity = async (id: string) => {
    setDeletingId(id)
    setError(null)
    try {
      await citiesApi.delete(id)
      await loadCities()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка удаления')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 pt-14 lg:pt-0 ml-0 lg:ml-64 min-h-screen min-w-0">
        <div className="border-b border-border/40 bg-white/50 backdrop-blur">
          <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <h1 className="text-2xl lg:text-3xl font-bold">Справочники</h1>
            <p className="text-muted-foreground mt-1">Города и другие справочные данные</p>
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          <Tabs defaultValue="cities" className="space-y-6">
            <TabsList className="grid w-fit grid-cols-1">
              <TabsTrigger value="cities">Города</TabsTrigger>
            </TabsList>
            <TabsContent value="cities" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                <p className="text-sm text-muted-foreground">
                  Города из этого списка можно выбирать при создании выставки (множественный выбор).
                </p>
                <Button onClick={() => { setModalOpen(true); setError(null); setNewCityName(''); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить город
                </Button>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              {citiesLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Загрузка...</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : cities.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {cities.map((city) => (
                    <Card key={city.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-sm truncate">{city.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteCity(city.id)}
                          disabled={deletingId === city.id}
                        >
                          {deletingId === city.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Нет городов. Добавьте первый город, чтобы выбирать его при создании выставки.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Новый город</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium">Название</label>
              <Input
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                placeholder="Например: Москва"
                className="mt-1"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCity()}
              />
            </div>
            <Button className="w-full" onClick={handleCreateCity} disabled={saving || !newCityName.trim()}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Создать
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ReferencePage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'content_manager']}>
      <ReferenceContent />
    </ProtectedRoute>
  )
}
