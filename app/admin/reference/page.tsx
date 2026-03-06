'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { useLocale } from '@/lib/i18n'
import { citiesApi, ApiCity } from '@/lib/api'
import { getCityName } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Loader2, Trash2, MapPin, Pencil } from 'lucide-react'

function ReferenceContent() {
  const { t, lang } = useLocale()
  const [cities, setCities] = useState<ApiCity[]>([])
  const [citiesLoading, setCitiesLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [newCityNameUz, setNewCityNameUz] = useState('')
  const [newCityNameRu, setNewCityNameRu] = useState('')
  const [newCityNameEn, setNewCityNameEn] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadCities = async () => {
    setCitiesLoading(true)
    try {
      const list = await citiesApi.list()
      setCities(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorLoadCities'))
    } finally {
      setCitiesLoading(false)
    }
  }

  useEffect(() => {
    loadCities()
  }, [])

  const handleCreateCity = async () => {
    const nameUz = newCityNameUz.trim()
    const nameRu = newCityNameRu.trim()
    const nameEn = newCityNameEn.trim()
    if (!nameUz || !nameRu || !nameEn) return
    setSaving(true)
    setError(null)
    try {
      await citiesApi.create({ nameUz, nameRu, nameEn })
      setNewCityNameUz('')
      setNewCityNameRu('')
      setNewCityNameEn('')
      setModalOpen(false)
      await loadCities()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorCreate'))
    } finally {
      setSaving(false)
    }
  }

  const [cityToDelete, setCityToDelete] = useState<ApiCity | null>(null)
  const [editingCity, setEditingCity] = useState<ApiCity | null>(null)
  const [editNameUz, setEditNameUz] = useState('')
  const [editNameRu, setEditNameRu] = useState('')
  const [editNameEn, setEditNameEn] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleDeleteCityClick = (city: ApiCity) => setCityToDelete(city)

  const handleEditCityClick = (city: ApiCity) => {
    setEditingCity(city)
    setEditNameUz(city.nameUz ?? city.name ?? '')
    setEditNameRu(city.nameRu ?? city.name ?? '')
    setEditNameEn(city.nameEn ?? city.name ?? '')
    setError(null)
  }

  const handleUpdateCity = async () => {
    if (!editingCity) return
    const nameUz = editNameUz.trim()
    const nameRu = editNameRu.trim()
    const nameEn = editNameEn.trim()
    if (!nameUz || !nameRu || !nameEn) return
    setUpdatingId(editingCity.id)
    setError(null)
    try {
      await citiesApi.update(editingCity.id, { nameUz, nameRu, nameEn })
      setEditingCity(null)
      await loadCities()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorCreate'))
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteCityConfirm = async () => {
    if (!cityToDelete) return
    const id = cityToDelete.id
    setDeletingId(id)
    setError(null)
    try {
      await citiesApi.delete(id)
      await loadCities()
      setCityToDelete(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorDelete'))
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
            <h1 className="text-2xl lg:text-3xl font-bold">{t('reference')}</h1>
            <p className="text-muted-foreground mt-1">{t('referenceSubtitle')}</p>
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start pb-4 border-b border-border/60">
                <p className="text-sm text-muted-foreground">
                  {t('citiesReferenceHint')}
                </p>
                <Button onClick={() => { setModalOpen(true); setError(null); setNewCityNameUz(''); setNewCityNameRu(''); setNewCityNameEn(''); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('addCity')}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              {citiesLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden py-0">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{t('loading')}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : cities.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {cities.map((city) => (
                    <Card key={city.id} className="overflow-hidden py-0 group hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-sm truncate">{getCityName(city, lang)}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleEditCityClick(city)}
                            disabled={updatingId === city.id}
                            title={t('editCity')}
                          >
                            {updatingId === city.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Pencil className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteCityClick(city)}
                            disabled={deletingId === city.id}
                          >
                            {deletingId === city.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    {t('noCitiesAddFirst')}
                  </CardContent>
                </Card>
              )}
            </div>
        </div>
      </main>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('newCity')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium">{t('title')} (UZ)</label>
              <Input
                value={newCityNameUz}
                onChange={(e) => setNewCityNameUz(e.target.value)}
                placeholder={t('cityNamePlaceholder')}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t('title')} (RU)</label>
              <Input
                value={newCityNameRu}
                onChange={(e) => setNewCityNameRu(e.target.value)}
                placeholder={t('cityNamePlaceholder')}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t('title')} (EN)</label>
              <Input
                value={newCityNameEn}
                onChange={(e) => setNewCityNameEn(e.target.value)}
                placeholder={t('cityNamePlaceholder')}
                className="mt-1"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCity()}
              />
            </div>
            <Button className="w-full" onClick={handleCreateCity} disabled={saving || !newCityNameUz.trim() || !newCityNameRu.trim() || !newCityNameEn.trim()}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('createButton')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingCity} onOpenChange={(open) => !open && setEditingCity(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('editCity')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium">{t('title')} (UZ)</label>
              <Input
                value={editNameUz}
                onChange={(e) => setEditNameUz(e.target.value)}
                placeholder={t('cityNamePlaceholder')}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t('title')} (RU)</label>
              <Input
                value={editNameRu}
                onChange={(e) => setEditNameRu(e.target.value)}
                placeholder={t('cityNamePlaceholder')}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t('title')} (EN)</label>
              <Input
                value={editNameEn}
                onChange={(e) => setEditNameEn(e.target.value)}
                placeholder={t('cityNamePlaceholder')}
                className="mt-1"
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateCity()}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditingCity(null)}>
                {t('cancel')}
              </Button>
              <Button className="flex-1" onClick={handleUpdateCity} disabled={updatingId !== null || !editNameUz.trim() || !editNameRu.trim() || !editNameEn.trim()}>
                {updatingId ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t('save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!cityToDelete} onOpenChange={(open) => !open && setCityToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('deleteCity')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {cityToDelete && (
              <p className="text-sm text-muted-foreground">
                «{getCityName(cityToDelete, lang)}». {t('cityDeleteWarning')}
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setCityToDelete(null)}>
                {t('cancel')}
              </Button>
              <Button className="flex-1 bg-red-600 text-white hover:bg-red-700" onClick={handleDeleteCityConfirm} disabled={deletingId !== null}>
                {deletingId ? <Loader2 className="w-4 h-4 animate-spin" /> : t('delete')}
              </Button>
            </div>
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
