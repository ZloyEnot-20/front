'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { useAdmin } from '@/lib/admin-context'
import { useAuth } from '@/lib/auth-context'
import { getImageUrl } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Loader2 } from 'lucide-react'
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
  const MAX_FILE_MB = 10

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

  const handleCreateContent = (type: 'news' | 'exhibition') => {
    setModalType(type)
    setEditingItem(null)
    setFormData({})
    setPendingImageFile(null)
    setUploadError(null)
    setModalOpen(true)
  }

  const handleEditContent = (item: any, type: 'news' | 'exhibition') => {
    setModalType(type)
    setEditingItem(item)
    setFormData({ ...item })
    setPendingImageFile(null)
    setUploadError(null)
    setModalOpen(true)
  }

  const handleSaveContent = async () => {
    if (!formData.title) return

    setSaving(true)
    setUploadError(null)
    try {
      const useFormData = !!pendingImageFile

      if (useFormData) {
        const fd = new FormData()
        fd.append('title', formData.title)
        if (modalType === 'exhibition') {
          fd.append('description', formData.description ?? '')
          fd.append('location', formData.location ?? '')
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
          if (modalType === 'exhibition') await updateExhibitionFormData(editingItem.id, fd)
          else await updateNewsFormData(editingItem.id, fd)
        } else {
          if (modalType === 'exhibition') await addExhibitionFormData(fd)
          else await addNewsFormData(fd)
        }
      } else {
        const dataToSave = { ...formData }
        if (editingItem) {
          if (modalType === 'exhibition') await updateExhibition(editingItem.id, dataToSave)
          else await updateNews(editingItem.id, dataToSave)
        } else {
          if (modalType === 'exhibition') {
            const newExhibition = {
              id: `exp-${Date.now()}`,
              title: dataToSave.title,
              description: dataToSave.description ?? '',
              startDate: dataToSave.startDate ?? new Date(),
              endDate: dataToSave.endDate ?? new Date(),
              location: dataToSave.location ?? '',
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
              ...dataToSave,
              id: `news-${Date.now()}`,
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
                            <DropdownMenuItem onClick={() => updateExhibition(exhibition.id, { status: exhibition.status === 'published' ? 'draft' : 'published' })}>
                              {exhibition.status === 'published' ? 'Снять с публикации' : 'Опубликовать'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteExhibition(exhibition.id)}>
                               Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                            <DropdownMenuItem onClick={() => updateNews(news.id, { status: news.status === 'published' ? 'draft' : 'published' })}>
                              {news.status === 'published' ? 'Снять с публикации' : 'Опубликовать'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteNews(news.id)}>
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                  <div className="mt-1 flex items-center gap-3">
                    {(pendingPreviewUrl || formData.image) ? (
                      <div className="relative">
                        <img
                          src={pendingPreviewUrl ?? getImageUrl(formData.image)}
                          alt=""
                          className="h-20 w-20 rounded object-cover border"
                          loading="lazy"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 text-destructive hover:text-destructive"
                          onClick={() => {
                            setFormData({ ...formData, image: '' })
                            setPendingImageFile(null)
                          }}
                        >
                          ×
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
                      <label className="text-sm font-medium">Место проведения</label>
                      <Input
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Введите место"
                      />
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
