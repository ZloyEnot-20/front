'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { useAdmin } from '@/lib/admin-context'
import { useAuth } from '@/lib/auth-context'
import { getImageUrl, citiesApi, ApiCity, usersApi, ApiUser } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Loader2, Trash2 } from 'lucide-react'
import { PublicationCardSkeleton } from '@/components/admin/publication-card-skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown } from 'lucide-react'

function PublicationsContent() {
  const { exhibitions, news, updateExhibition, updateExhibitionFormData, deleteExhibition, deleteNews, updateNews, updateNewsFormData, addExhibition, addExhibitionFormData, addNews, addNewsFormData, isLoading } = useAdmin()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'news' | 'exhibition'>('news')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [togglingStatusExhibitionId, setTogglingStatusExhibitionId] = useState<string | null>(null)
  const [togglingStatusNewsId, setTogglingStatusNewsId] = useState<string | null>(null)
  const [citiesList, setCitiesList] = useState<ApiCity[]>([])
  const [citiesListLoading, setCitiesListLoading] = useState(false)
  const [exhibitorsList, setExhibitorsList] = useState<ApiUser[]>([])
  const [exhibitorsListLoading, setExhibitorsListLoading] = useState(false)
  const MAX_FILE_MB = 10

  const handleToggleExhibitionStatus = async (id: string, currentStatus: string) => {
    setTogglingStatusExhibitionId(id)
    try {
      await updateExhibition(id, { status: currentStatus === 'published' ? 'draft' : 'published' })
    } finally {
      setTogglingStatusExhibitionId(null)
    }
  }

  const handleToggleNewsStatus = async (id: string, currentStatus: string) => {
    setTogglingStatusNewsId(id)
    try {
      await updateNews(id, { status: currentStatus === 'published' ? 'draft' : 'published' })
    } finally {
      setTogglingStatusNewsId(null)
    }
  }

  useEffect(() => {
    if (!pendingImageFile) {
      setPendingPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      return
    }
    const url = URL.createObjectURL(pendingImageFile)
    setPendingPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingImageFile])

  const filteredExhibitions = exhibitions.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredNews = news.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    if (modalOpen && modalType === 'exhibition') {
      if (citiesList.length === 0) {
        setCitiesListLoading(true)
        citiesApi.list().then(setCitiesList).catch(() => setCitiesList([])).finally(() => setCitiesListLoading(false))
      }
      if (exhibitorsList.length === 0) {
        setExhibitorsListLoading(true)
        usersApi.list({ role: 'exhibitor' }).then(setExhibitorsList).catch(() => setExhibitorsList([])).finally(() => setExhibitorsListLoading(false))
      }
    }
  }, [modalOpen, modalType])

  const handleCreateContent = (type: 'news' | 'exhibition') => {
    setModalType(type)
    setEditingItem(null)
    setFormData(type === 'exhibition' ? { cities: [], participants: [] } : {})
    setPendingImageFile(null)
    setUploadError(null)
    setModalOpen(true)
  }

  const handleEditContent = (item: any, type: 'news' | 'exhibition') => {
    setModalType(type)
    setEditingItem(item)
    const cityIds = (item.cities ?? []).map((c: { id: string; name: string } | string) => typeof c === 'string' ? c : c.id)
    const participantIds = (item.participants ?? []).map((p: { id: string } | string) => typeof p === 'string' ? p : p.id)
    setFormData({ ...item, cities: cityIds, participants: participantIds })
    setPendingImageFile(null)
    setUploadError(null)
    setModalOpen(true)
  }

  const toggleCity = (cityId: string) => {
    const list = formData.cities ?? []
    const next = list.includes(cityId) ? list.filter((id) => id !== cityId) : [...list, cityId]
    setFormData({ ...formData, cities: next })
  }

  const removeCity = (cityId: string) => {
    setFormData({ ...formData, cities: (formData.cities ?? []).filter((id) => id !== cityId) })
  }

  const toggleParticipant = (userId: string) => {
    const list = formData.participants ?? []
    const next = list.includes(userId) ? list.filter((id) => id !== userId) : [...list, userId]
    setFormData({ ...formData, participants: next })
  }

  const removeParticipant = (userId: string) => {
    setFormData({ ...formData, participants: (formData.participants ?? []).filter((id) => id !== userId) })
  }

  const handleSaveContent = async () => {
    setUploadError(null)

    if (modalType === 'exhibition') {
      const title = (formData.title ?? '').trim()
      const description = (formData.description ?? '').trim()
      const start = formData.startDate ? (formData.startDate instanceof Date ? formData.startDate : new Date(formData.startDate)) : null
      const end = formData.endDate ? (formData.endDate instanceof Date ? formData.endDate : new Date(formData.endDate)) : null
      if (!title) {
        setUploadError('Введите название выставки')
        return
      }
      if (!description) {
        setUploadError('Введите описание выставки')
        return
      }
      if (!start || !end) {
        setUploadError('Укажите дату начала и дату окончания')
        return
      }
      if (start > end) {
        setUploadError('Дата окончания должна быть не раньше даты начала')
        return
      }
    } else {
      const title = (formData.title ?? '').trim()
      const excerpt = (formData.excerpt ?? '').trim()
      const content = (formData.content ?? '').trim()
      if (!title) {
        setUploadError('Введите название новости')
        return
      }
      if (!excerpt) {
        setUploadError('Введите краткое описание новости')
        return
      }
      if (!content) {
        setUploadError('Введите полный текст новости')
        return
      }
    }

    setSaving(true)
    try {
      const useFormData = !!pendingImageFile

      if (useFormData) {
        const fd = new FormData()
        fd.append('title', formData.title)
        if (modalType === 'exhibition') {
          fd.append('description', formData.description ?? '')
          fd.append('cities', JSON.stringify(formData.cities ?? []))
          fd.append('participants', JSON.stringify(formData.participants ?? []))
          const start = formData.startDate ? (formData.startDate instanceof Date ? formData.startDate : new Date(formData.startDate)) : new Date()
          const end = formData.endDate ? (formData.endDate instanceof Date ? formData.endDate : new Date(formData.endDate)) : new Date()
          fd.append('startDate', start.toISOString())
          fd.append('endDate', end.toISOString())
          fd.append('status', formData.status ?? 'draft')
        } else {
          fd.append('content', formData.content ?? '')
          fd.append('excerpt', formData.excerpt ?? '')
          const pub = formData.publishedAt ? (formData.publishedAt instanceof Date ? formData.publishedAt : new Date(formData.publishedAt)) : new Date()
          fd.append('publishedAt', pub.toISOString())
          fd.append('status', formData.status ?? 'draft')
        }
        fd.append('createdBy', user?.id || '')
        fd.append('image', pendingImageFile)

        if (editingItem) {
          if (modalType === 'exhibition') {
            await updateExhibitionFormData(editingItem.id, fd)
          } else await updateNewsFormData(editingItem.id, fd)
        } else {
          if (modalType === 'exhibition') {
            await addExhibitionFormData(fd)
          } else await addNewsFormData(fd)
        }
      } else {
        const dataToSave = { ...formData }
        if (editingItem) {
          if (modalType === 'exhibition') {
            await updateExhibition(editingItem.id, { ...dataToSave, cities: dataToSave.cities ?? [], participants: dataToSave.participants ?? [] })
          } else {
            const newsPayload = {
              title: dataToSave.title,
              content: dataToSave.content ?? '',
              excerpt: dataToSave.excerpt ?? '',
              image: dataToSave.image,
              publishedAt: dataToSave.publishedAt ?? new Date(),
              status: (dataToSave.status as 'draft' | 'published') ?? 'draft',
            }
            await updateNews(editingItem.id, newsPayload)
          }
        } else {
          if (modalType === 'exhibition') {
            const newExhibition = {
              id: `exp-${Date.now()}`,
              title: dataToSave.title,
              description: dataToSave.description ?? '',
              startDate: dataToSave.startDate ?? new Date(),
              endDate: dataToSave.endDate ?? new Date(),
              cities: dataToSave.cities ?? [],
              participants: dataToSave.participants ?? [],
              image: dataToSave.image,
              status: (dataToSave.status as 'draft' | 'published') ?? 'draft',
              participantCount: 0,
              registrations: 0,
              createdBy: user?.id || '3',
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            await addExhibition(newExhibition)
          } else {
            const newNews = {
              id: `news-${Date.now()}`,
              title: dataToSave.title,
              content: dataToSave.content ?? '',
              excerpt: dataToSave.excerpt ?? '',
              image: dataToSave.image,
              publishedAt: dataToSave.publishedAt ?? new Date(),
              status: (dataToSave.status as 'draft' | 'published') ?? 'draft',
              createdBy: user?.id || '3',
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            await addNews(newNews)
          }
        }
      }
      setPendingImageFile(null)
      setModalOpen(false)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Ошибка сохранения'
      setUploadError(msg)
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 pt-14 lg:pt-0 ml-0 lg:ml-64 min-h-screen min-w-0">
        {/* Header */}
        <div className="border-b border-border/40 bg-white/50 backdrop-blur">
          <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <h1 className="text-2xl lg:text-3xl font-bold">Публикации</h1>
            <p className="text-muted-foreground mt-1">Управление выставками и новостями</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <Tabs defaultValue="exhibitions" className="space-y-6">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="exhibitions">Выставки</TabsTrigger>
              <TabsTrigger value="news">Новости</TabsTrigger>
            </TabsList>

            {/* Exhibitions Tab */}
            <TabsContent value="exhibitions" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Поиск выставок..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Button onClick={() => handleCreateContent('exhibition')}>+ Новая выставка</Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <PublicationCardSkeleton key={i} />
                  ))
                ) : filteredExhibitions.length > 0 ? (
                  filteredExhibitions.map((exhibition) => (
                    <Card key={exhibition.id} className="group hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-muted relative overflow-hidden">
                        {exhibition.image ? (
                          <img src={getImageUrl(exhibition.image) || "/placeholder.svg"} alt={exhibition.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                            <span className="text-2xl font-bold text-muted-foreground/20">
                              {exhibition.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        <Badge className="absolute top-1 right-1 text-[10px] px-1 py-0" variant={exhibition.status === 'published' ? 'default' : 'secondary'}>
                          {exhibition.status === 'draft' ? 'Черн.' : 'Опубл.'}
                        </Badge>
                      </div>
                      <CardContent className="p-2">
                        <h3 className="font-semibold text-xs line-clamp-1 mb-1">{exhibition.title}</h3>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">
                          {exhibition.description}
                        </p>
                        <div className="space-y-0.5 text-[10px] text-muted-foreground mb-2">
                          <div>{new Date(exhibition.startDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</div>
                          <div>{exhibition.registrations} чел.</div>
                        </div>
                        {togglingStatusExhibitionId === exhibition.id ? (
                          <Button variant="outline" size="sm" className="w-full h-7 text-xs bg-violet-600 text-white border-violet-600" disabled>
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                            Сохранение...
                          </Button>
                        ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full h-7 text-xs bg-violet-600 hover:bg-violet-500 text-white border-violet-600 hover:border-violet-500 transition-colors">
                              Управление
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditContent(exhibition, 'exhibition')}>
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={`/exhibitions/${exhibition.id}`} target="_blank" rel="noopener noreferrer">
                                 Просмотр
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleExhibitionStatus(exhibition.id, exhibition.status)}>
                              {exhibition.status === 'published' ? 'Снять с публикации' : 'Опубликовать'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteExhibition(exhibition.id)}>
                               Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">Выставки не найдены</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* News Tab */}
            <TabsContent value="news" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Поиск новостей..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Button onClick={() => handleCreateContent('news')}>+ Новая новость</Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <PublicationCardSkeleton key={i} />
                  ))
                ) : filteredNews.length > 0 ? (
                  filteredNews.map((news) => (
                    <Card key={news.id} className="group hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-muted relative overflow-hidden">
                        {news.image ? (
                          <img src={getImageUrl(news.image) || "/placeholder.svg"} alt={news.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/10 to-primary/10">
                            <span className="text-2xl font-bold text-muted-foreground/20">
                              {news.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        <Badge className="absolute top-1 right-1 text-[10px] px-1 py-0" variant={news.status === 'published' ? 'default' : 'secondary'}>
                          {news.status === 'draft' ? 'Черн.' : 'Опубл.'}
                        </Badge>
                      </div>
                      <CardContent className="p-2">
                        <h3 className="font-semibold text-xs line-clamp-1 mb-1">{news.title}</h3>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">
                          {news.excerpt}
                        </p>
                        <div className="text-[10px] text-muted-foreground mb-2">
                          {new Date(news.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                        </div>
                        {togglingStatusNewsId === news.id ? (
                          <Button variant="outline" size="sm" className="w-full h-7 text-xs bg-violet-600 text-white border-violet-600" disabled>
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                            Сохранение...
                          </Button>
                        ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full h-7 text-xs bg-violet-600 hover:bg-violet-500 text-white border-violet-600 hover:border-violet-500 transition-colors">
                              Управление
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditContent(news, 'news')}>
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={`/news/${news.id}`} target="_blank" rel="noopener noreferrer">
                                Просмотр
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleNewsStatus(news.id, news.status)}>
                              {news.status === 'published' ? 'Снять с публикации' : 'Опубликовать'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteNews(news.id)}>
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">Новости не найдены</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Modal for Creating/Editing */}
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem
                    ? `Редактировать ${modalType === 'exhibition' ? 'выставку' : 'новость'}`
                    : `Создать новую ${modalType === 'exhibition' ? 'выставку' : 'новость'}`}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Название</label>
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Введите название"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Изображение</label>
                  <div className="mt-1 flex flex-wrap items-start gap-3">
                    {(pendingPreviewUrl || formData.image) ? (
                      <div className="flex flex-col gap-2">
                        <img
                          src={pendingPreviewUrl ?? getImageUrl(formData.image)}
                          alt=""
                          className="h-36 w-36 rounded-lg object-cover border"
                          loading="lazy"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full bg-violet-600 hover:bg-violet-500 text-white border-violet-600 hover:border-violet-500"
                          onClick={() => {
                            setFormData({ ...formData, image: '' })
                            setPendingImageFile(null)
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1.5" />
                          Удалить изображение
                        </Button>
                      </div>
                    ) : null}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={saving}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setUploadError(null)
                          if (file.size > MAX_FILE_MB * 1024 * 1024) {
                            setUploadError(`Файл слишком большой. Максимум ${MAX_FILE_MB} МБ.`)
                            e.target.value = ''
                            return
                          }
                          setPendingImageFile(file)
                          e.target.value = ''
                        }}
                      />
                      <span className="text-sm text-primary hover:underline">Выбрать файл</span>
                      <span className="text-xs text-muted-foreground ml-1">(макс. {MAX_FILE_MB} МБ)</span>
                    </label>
                    {uploadError ? <p className="text-sm text-destructive mt-1">{uploadError}</p> : null}
                  </div>
                </div>
                {modalType === 'exhibition' ? (
                  <>
                    <div>
                      <label className="text-sm font-medium">Описание</label>
                      <Textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Введите описание"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Города</label>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-1">Выберите города из справочника (множественный выбор)</p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between font-normal" disabled={citiesListLoading}>
                            {citiesListLoading ? 'Загрузка...' : (formData.cities ?? []).length ? `Выбрано: ${(formData.cities ?? []).length}` : 'Выберите города'}
                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] max-h-60 overflow-y-auto p-2" align="start">
                          {citiesList.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2">Нет городов. Добавьте города в разделе Справочники → Города.</p>
                          ) : (
                            <div className="space-y-1">
                              {citiesList.map((city) => (
                                <label key={city.id} className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent cursor-pointer">
                                  <Checkbox
                                    checked={(formData.cities ?? []).includes(city.id)}
                                    onCheckedChange={() => toggleCity(city.id)}
                                  />
                                  <span className="text-sm">{city.name}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(formData.cities ?? []).map((id: string) => {
                          const city = citiesList.find((c) => c.id === id)
                          const name = city?.name ?? id
                          return (
                            <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => removeCity(id)}>
                              {name} ×
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Участники (университеты)</label>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-1">Выберите exhibitor из списка (множественный выбор)</p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between font-normal" disabled={exhibitorsListLoading}>
                            {exhibitorsListLoading ? 'Загрузка...' : (formData.participants ?? []).length ? `Выбрано: ${(formData.participants ?? []).length}` : 'Выберите участников'}
                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] max-h-60 overflow-y-auto p-2" align="start">
                          {exhibitorsList.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2">Нет университетов с ролью exhibitor. Создайте пользователей с ролью exhibitor в разделе Пользователи.</p>
                          ) : (
                            <div className="space-y-1">
                              {exhibitorsList.map((exh) => (
                                <label key={exh.id} className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent cursor-pointer">
                                  <Checkbox
                                    checked={(formData.participants ?? []).includes(exh.id)}
                                    onCheckedChange={() => toggleParticipant(exh.id)}
                                  />
                                  <span className="text-sm">{exh.name}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(formData.participants ?? []).map((id: string) => {
                          const exh = exhibitorsList.find((e) => e.id === id)
                          const name = exh?.name ?? id
                          return (
                            <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => removeParticipant(id)}>
                              {name} ×
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Дата начала</label>
                        <Input
                          type="date"
                          value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Дата окончания</label>
                        <Input
                          type="date"
                          value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium">Краткое описание</label>
                      <Input
                        value={formData.excerpt || ''}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        placeholder="Введите краткое описание"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Полный текст</label>
                      <Textarea
                        value={formData.content || ''}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Введите полный текст новости"
                        rows={6}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Дата публикации</label>
                      <Input
                        type="date"
                        value={formData.publishedAt ? new Date(formData.publishedAt).toISOString().split('T')[0] : ''}
                        onChange={(e) => setFormData({ ...formData, publishedAt: new Date(e.target.value) })}
                      />
                    </div>
                  </>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setModalOpen(false)} disabled={saving}>
                    Отмена
                  </Button>
                  <Button className="flex-1" onClick={handleSaveContent} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Сохранение...
                      </>
                    ) : (
                      'Сохранить'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}

export default function PublicationsPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'content_manager']}>
      <PublicationsContent />
    </ProtectedRoute>
  )
}
