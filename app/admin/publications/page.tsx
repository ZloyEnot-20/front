'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { useLocale } from '@/lib/i18n'
import { useAdmin } from '@/lib/admin-context'
import { useAuth } from '@/lib/auth-context'
import { getImageUrl, citiesApi, ApiCity, usersApi, ApiUser } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Loader2, Trash2, LayoutGrid, Pencil, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { PublicationCardSkeleton } from '@/components/admin/publication-card-skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { cn, getCityName, formatDateLocalized, getContentTitle, getContentDescription, getNewsContent } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

function PublicationsContent() {
  const { t, lang } = useLocale()
  const { exhibitions, news, updateExhibition, updateExhibitionFormData, deleteExhibition, deleteNews, updateNews, updateNewsFormData, addExhibition, addExhibitionFormData, addNews, addNewsFormData, isLoading } = useAdmin()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'news' | 'exhibition'>('news')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const [pendingBannerFile, setPendingBannerFile] = useState<File | null>(null)
  const [pendingBannerPreviewUrl, setPendingBannerPreviewUrl] = useState<string | null>(null)
  const [pendingImagesFiles, setPendingImagesFiles] = useState<File[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const MAX_IMAGES = 10
  const [saving, setSaving] = useState(false)
  const [togglingStatusExhibitionId, setTogglingStatusExhibitionId] = useState<string | null>(null)
  const [togglingStatusNewsId, setTogglingStatusNewsId] = useState<string | null>(null)
  const [citiesList, setCitiesList] = useState<ApiCity[]>([])
  const [citiesListLoading, setCitiesListLoading] = useState(false)
  const [exhibitorsList, setExhibitorsList] = useState<ApiUser[]>([])
  const [exhibitorsListLoading, setExhibitorsListLoading] = useState(false)
  const [citiesDropdownOpen, setCitiesDropdownOpen] = useState(false)
  const [participantsDropdownOpen, setParticipantsDropdownOpen] = useState(false)
  const citiesDropdownRef = useRef<HTMLDivElement>(null)
  const participantsDropdownRef = useRef<HTMLDivElement>(null)
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
    if (!pendingBannerFile) {
      setPendingBannerPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      return
    }
    const url = URL.createObjectURL(pendingBannerFile)
    setPendingBannerPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingBannerFile])

  const filteredExhibitions = useMemo(() => {
    const list = exhibitions.filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase()))
    return list.sort((a, b) => (a.status === 'draft' ? 1 : 0) - (b.status === 'draft' ? 1 : 0))
  }, [exhibitions, searchQuery])

  const filteredNews = useMemo(() => {
    const list = news.filter((n) => n.title.toLowerCase().includes(searchQuery.toLowerCase()))
    return list.sort((a, b) => (a.status === 'draft' ? 1 : 0) - (b.status === 'draft' ? 1 : 0))
  }, [news, searchQuery])

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
    setFormData(
      type === 'exhibition'
        ? { venueRu: '', venueUz: '', venueEn: '', cities: [], participants: [], images: [], titleUz: '', titleRu: '', titleEn: '', descriptionUz: '', descriptionRu: '', descriptionEn: '' }
        : { images: [], titleUz: '', titleRu: '', titleEn: '', contentUz: '', contentRu: '', contentEn: '', excerptUz: '', excerptRu: '', excerptEn: '' }
    )
    setPendingBannerFile(null)
    setPendingImagesFiles([])
    setUploadError(null)
    setModalOpen(true)
  }

  const handleEditContent = (item: any, type: 'news' | 'exhibition') => {
    setModalType(type)
    setEditingItem(item)
    const cityIds = (item.cities ?? []).map((c: { id: string; name: string } | string) => typeof c === 'string' ? c : c.id)
    const participantIds = (item.participants ?? []).map((p: { id: string } | string) => typeof p === 'string' ? p : p.id)
    setFormData({
      ...item,
      cities: cityIds,
      participants: participantIds,
      banner: item.banner ?? item.image,
      images: item.images ?? [],
      titleUz: item.titleUz ?? item.title ?? '',
      titleRu: item.titleRu ?? item.title ?? '',
      titleEn: item.titleEn ?? item.title ?? '',
      ...(type === 'exhibition'
        ? {
            descriptionUz: item.descriptionUz ?? item.description ?? '',
            descriptionRu: item.descriptionRu ?? item.description ?? '',
            descriptionEn: item.descriptionEn ?? item.description ?? '',
            venueRu: item.venueRu ?? item.venue ?? '',
            venueUz: item.venueUz ?? item.venue ?? '',
            venueEn: item.venueEn ?? item.venue ?? '',
          }
        : {
            contentUz: item.contentUz ?? item.content ?? '',
            contentRu: item.contentRu ?? item.content ?? '',
            contentEn: item.contentEn ?? item.content ?? '',
            excerptUz: item.excerptUz ?? item.excerpt ?? '',
            excerptRu: item.excerptRu ?? item.excerpt ?? '',
            excerptEn: item.excerptEn ?? item.excerpt ?? '',
          }),
    })
    setPendingBannerFile(null)
    setPendingImagesFiles([])
    setUploadError(null)
    setModalOpen(true)
  }

  const toggleCity = (cityId: string) => {
    const list: string[] = formData.cities ?? []
    const next = list.includes(cityId) ? list.filter((id: string) => id !== cityId) : [...list, cityId]
    setFormData({ ...formData, cities: next })
  }

  const removeCity = (cityId: string) => {
    setFormData({ ...formData, cities: (formData.cities ?? []).filter((id: string) => id !== cityId) })
  }

  const toggleParticipant = (userId: string) => {
    const list = formData.participants ?? []
    const next = list.includes(userId) ? list.filter((id:string) => id !== userId) : [...list, userId]
    setFormData({ ...formData, participants: next })
  }

  const removeParticipant = (userId: string) => {
    setFormData({ ...formData, participants: (formData.participants ?? []).filter((id:string) => id !== userId) })
  }

  useEffect(() => {
    const closeOnOutside = (e: MouseEvent) => {
      if (citiesDropdownRef.current && !citiesDropdownRef.current.contains(e.target as Node)) setCitiesDropdownOpen(false)
      if (participantsDropdownRef.current && !participantsDropdownRef.current.contains(e.target as Node)) setParticipantsDropdownOpen(false)
    }
    if (citiesDropdownOpen || participantsDropdownOpen) {
      document.addEventListener('mousedown', closeOnOutside)
      return () => document.removeEventListener('mousedown', closeOnOutside)
    }
  }, [citiesDropdownOpen, participantsDropdownOpen])

  const handleSaveContent = async () => {
    setUploadError(null)

    if (modalType === 'exhibition') {
      const titleUz = (formData.titleUz ?? '').trim()
      const titleRu = (formData.titleRu ?? formData.title ?? '').trim()
      const titleEn = (formData.titleEn ?? '').trim()
      const descriptionUz = (formData.descriptionUz ?? '').trim()
      const descriptionRu = (formData.descriptionRu ?? formData.description ?? '').trim()
      const descriptionEn = (formData.descriptionEn ?? '').trim()
      const start = formData.startDate ? (formData.startDate instanceof Date ? formData.startDate : new Date(formData.startDate)) : null
      const end = formData.endDate ? (formData.endDate instanceof Date ? formData.endDate : new Date(formData.endDate)) : null
      if (!titleUz || !titleRu || !titleEn) {
        setUploadError(t('enterExhibitionTitle'))
        return
      }
      if (!descriptionUz || !descriptionRu || !descriptionEn) {
        setUploadError(t('enterExhibitionDescription'))
        return
      }
      const venueRu = (formData.venueRu ?? '').trim()
      const venueUz = (formData.venueUz ?? '').trim()
      const venueEn = (formData.venueEn ?? '').trim()
      if (!venueRu && !venueUz && !venueEn) {
        setUploadError(t('enterVenue'))
        return
      }
      if (!start || !end) {
        setUploadError(t('enterDates'))
        return
      }
      if (start > end) {
        setUploadError(t('endDateAfterStart'))
        return
      }
      const cityIds = formData.cities ?? []
      if (cityIds.length === 0) {
        setUploadError(t('selectAtLeastOneCity'))
        return
      }
      const participantIds = formData.participants ?? []
      if (participantIds.length === 0) {
        setUploadError(t('selectAtLeastOneParticipant'))
        return
      }
      if (!formData.banner && !pendingBannerFile) {
        setUploadError(t('uploadImageExhibition'))
        return
      }
    } else {
      const titleUz = (formData.titleUz ?? '').trim()
      const titleRu = (formData.titleRu ?? formData.title ?? '').trim()
      const titleEn = (formData.titleEn ?? '').trim()
      const contentUz = (formData.contentUz ?? '').trim()
      const contentRu = (formData.contentRu ?? formData.content ?? '').trim()
      const contentEn = (formData.contentEn ?? '').trim()
      const excerptUz = (formData.excerptUz ?? '').trim()
      const excerptRu = (formData.excerptRu ?? formData.excerpt ?? '').trim()
      const excerptEn = (formData.excerptEn ?? '').trim()
      if (!titleUz || !titleRu || !titleEn) {
        setUploadError(t('enterNewsTitle'))
        return
      }
      if (!contentUz || !contentRu || !contentEn) {
        setUploadError(t('enterNewsContent'))
        return
      }
      if (!excerptUz || !excerptRu || !excerptEn) {
        setUploadError(t('fillExcerptAllLangs'))
        return
      }
      if (!formData.banner && !pendingBannerFile) {
        setUploadError(t('uploadImageNews'))
        return
      }
    }

    setSaving(true)
    try {
      const useFormData = !!pendingBannerFile || pendingImagesFiles.length > 0

      if (useFormData) {
        const fd = new FormData()
        if (modalType === 'exhibition') {
          fd.append('titleUz', (formData.titleUz ?? '').trim())
          fd.append('titleRu', (formData.titleRu ?? formData.title ?? '').trim())
          fd.append('titleEn', (formData.titleEn ?? '').trim())
          fd.append('descriptionUz', (formData.descriptionUz ?? '').trim())
          fd.append('descriptionRu', (formData.descriptionRu ?? formData.description ?? '').trim())
          fd.append('descriptionEn', (formData.descriptionEn ?? '').trim())
          const vRu = (formData.venueRu ?? '').trim()
          const vUz = (formData.venueUz ?? '').trim()
          const vEn = (formData.venueEn ?? '').trim()
          fd.append('venueRu', vRu)
          fd.append('venueUz', vUz)
          fd.append('venueEn', vEn)
          fd.append('venue', vRu || vEn || vUz)
          fd.append('cities', JSON.stringify(formData.cities ?? []))
          fd.append('participants', JSON.stringify(formData.participants ?? []))
          const start = formData.startDate ? (formData.startDate instanceof Date ? formData.startDate : new Date(formData.startDate)) : new Date()
          const end = formData.endDate ? (formData.endDate instanceof Date ? formData.endDate : new Date(formData.endDate)) : new Date()
          fd.append('startDate', start.toISOString())
          fd.append('endDate', end.toISOString())
          fd.append('status', formData.status ?? 'draft')
        } else {
          fd.append('titleUz', (formData.titleUz ?? '').trim())
          fd.append('titleRu', (formData.titleRu ?? formData.title ?? '').trim())
          fd.append('titleEn', (formData.titleEn ?? '').trim())
          fd.append('contentUz', (formData.contentUz ?? '').trim())
          fd.append('contentRu', (formData.contentRu ?? formData.content ?? '').trim())
          fd.append('contentEn', (formData.contentEn ?? '').trim())
          fd.append('excerptUz', (formData.excerptUz ?? '').trim())
          fd.append('excerptRu', (formData.excerptRu ?? formData.excerpt ?? '').trim())
          fd.append('excerptEn', (formData.excerptEn ?? '').trim())
          const pub = formData.publishedAt ? (formData.publishedAt instanceof Date ? formData.publishedAt : new Date(formData.publishedAt)) : new Date()
          fd.append('publishedAt', pub.toISOString())
          fd.append('status', formData.status ?? 'draft')
        }
        fd.append('createdBy', user?.id || '')
        if (pendingBannerFile) {
          fd.append('banner', pendingBannerFile)
        } else if (formData.banner) {
          fd.append('banner', formData.banner)
        }
        const existingImages = formData.images ?? []
        if (pendingImagesFiles.length > 0) {
          fd.append('imagesExisting', JSON.stringify(existingImages))
          pendingImagesFiles.slice(0, MAX_IMAGES).forEach((file) => fd.append('images', file))
        } else if (existingImages.length > 0) {
          fd.append('images', JSON.stringify(existingImages))
        }

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
        const banner = dataToSave.banner ?? dataToSave.image
        if (editingItem) {
          if (modalType === 'exhibition') {
            const vRu = (dataToSave.venueRu ?? '').trim()
            const vUz = (dataToSave.venueUz ?? '').trim()
            const vEn = (dataToSave.venueEn ?? '').trim()
            await updateExhibition(editingItem.id, { ...dataToSave, venue: vRu || vEn || vUz, venueRu: vRu || undefined, venueUz: vUz || undefined, venueEn: vEn || undefined, cities: dataToSave.cities ?? [], participants: dataToSave.participants ?? [], banner, images: dataToSave.images ?? [], titleUz: dataToSave.titleUz, titleRu: dataToSave.titleRu, titleEn: dataToSave.titleEn, descriptionUz: dataToSave.descriptionUz, descriptionRu: dataToSave.descriptionRu, descriptionEn: dataToSave.descriptionEn })
          } else {
            const newsPayload = {
              title: dataToSave.titleRu ?? dataToSave.title,
              titleUz: dataToSave.titleUz,
              titleRu: dataToSave.titleRu,
              titleEn: dataToSave.titleEn,
              content: dataToSave.contentRu ?? dataToSave.content ?? '',
              contentUz: dataToSave.contentUz,
              contentRu: dataToSave.contentRu,
              contentEn: dataToSave.contentEn,
              excerpt: dataToSave.excerptRu ?? dataToSave.excerpt ?? '',
              excerptUz: dataToSave.excerptUz,
              excerptRu: dataToSave.excerptRu,
              excerptEn: dataToSave.excerptEn,
              image: banner,
              banner,
              images: dataToSave.images ?? [],
              publishedAt: dataToSave.publishedAt ?? new Date(),
              status: (dataToSave.status as 'draft' | 'published') ?? 'draft',
            }
            await updateNews(editingItem.id, newsPayload)
          }
        } else {
          if (modalType === 'exhibition') {
            const newExhibition = {
              id: `exp-${Date.now()}`,
              title: dataToSave.titleRu ?? dataToSave.title,
              titleUz: dataToSave.titleUz,
              titleRu: dataToSave.titleRu,
              titleEn: dataToSave.titleEn,
              description: dataToSave.descriptionRu ?? dataToSave.description ?? '',
              descriptionUz: dataToSave.descriptionUz,
              descriptionRu: dataToSave.descriptionRu,
              descriptionEn: dataToSave.descriptionEn,
              venue: (dataToSave.venueRu ?? dataToSave.venueUz ?? dataToSave.venueEn ?? '').trim() || (dataToSave.venue ?? '').trim(),
              venueRu: (dataToSave.venueRu ?? '').trim() || undefined,
              venueUz: (dataToSave.venueUz ?? '').trim() || undefined,
              venueEn: (dataToSave.venueEn ?? '').trim() || undefined,
              startDate: dataToSave.startDate ?? new Date(),
              endDate: dataToSave.endDate ?? new Date(),
              cities: dataToSave.cities ?? [],
              participants: dataToSave.participants ?? [],
              image: banner,
              banner,
              images: dataToSave.images ?? [],
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
              title: dataToSave.titleRu ?? dataToSave.title,
              titleUz: dataToSave.titleUz,
              titleRu: dataToSave.titleRu,
              titleEn: dataToSave.titleEn,
              content: dataToSave.contentRu ?? dataToSave.content ?? '',
              contentUz: dataToSave.contentUz,
              contentRu: dataToSave.contentRu,
              contentEn: dataToSave.contentEn,
              excerpt: dataToSave.excerptRu ?? dataToSave.excerpt ?? '',
              excerptUz: dataToSave.excerptUz,
              excerptRu: dataToSave.excerptRu,
              excerptEn: dataToSave.excerptEn,
              image: banner,
              banner,
              images: dataToSave.images ?? [],
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
      setPendingBannerFile(null)
      setPendingImagesFiles([])
      setModalOpen(false)
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('saveError')
      setUploadError(msg)
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 pt-14 lg:pt-0 ml-0 lg:ml-64 min-h-screen min-w-0 px-[10%]">
        <div className="max-w-[1400px] mx-auto w-full">
          {/* Header */}
          <div className="border-b border-border/40 bg-white/50 backdrop-blur">
            <div className="py-4 lg:py-6">
            <h1 className="text-2xl lg:text-3xl font-bold">{t('publications')}</h1>
            <p className="text-muted-foreground mt-1">{t('publicationManagement')}</p>
          </div>
        </div>

        {/* Content */}
        <div className="py-4 sm:py-6 lg:py-8">
          <Tabs defaultValue="exhibitions" className="space-y-0">
            <div>
              <TabsList className="h-auto w-full sm:w-fit rounded-none bg-transparent p-0 gap-6 sm:gap-8 shadow-none min-h-0 pb-0">
                <TabsTrigger
                  value="exhibitions"
                  className="group relative rounded-none bg-transparent px-0 pt-3 pb-0 text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 flex flex-col items-center"
                >
                  <span className="inline-block">
                    {t('exhibitions')}
                    <span className="block w-full h-[3px] rounded-full bg-primary opacity-0 group-data-[state=active]:opacity-100 mt-0 shrink-0" aria-hidden />
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="news"
                  className="group relative rounded-none bg-transparent px-0 pt-3 pb-0 text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 flex flex-col items-center"
                >
                  <span className="inline-block">
                    {t('news')}
                    <span className="block w-full h-[3px] rounded-full bg-primary opacity-0 group-data-[state=active]:opacity-100 mt-0 shrink-0" aria-hidden />
                  </span>
                </TabsTrigger>
            </TabsList>
              <div className="h-[3px] -mt-[3px] flex items-end">
                <div className="w-[30%] h-px bg-border rounded-full" aria-hidden />
              </div>
            </div>

            {/* Exhibitions Tab */}
            <TabsContent value="exhibitions" className="space-y-6 p-0 pt-6">
              <div className="flex flex-col sm:flex-row gap-4 pb-4 border-b border-border/60">
                <Input
                  placeholder={t('searchExhibitions')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Button onClick={() => handleCreateContent('exhibition')}>+ {t('newExhibition')}</Button>
              </div>

                {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <PublicationCardSkeleton key={i} />
                  ))}
                </div>
                ) : filteredExhibitions.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {filteredExhibitions.map((exhibition) => (
                    <Card key={exhibition.id} className="group overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 relative aspect-[2/3] w-full">
                      <Link href={`/exhibitions/${exhibition.id}`} className="absolute inset-0 z-0" target="_blank" rel="noopener noreferrer">
                        {exhibition.image ? (
                          <img src={getImageUrl(exhibition.image) || "/placeholder.svg"} alt={getContentTitle(exhibition, lang)} className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 group-hover:blur-[3px] transition-all duration-500" loading="lazy" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                            <span className="text-3xl font-bold text-muted-foreground/30">{(getContentTitle(exhibition, lang) || '?').charAt(0)}</span>
                          </div>
                        )}
                      </Link>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 from-30% via-black/20 to-transparent pointer-events-none z-10" />
                      <div className="absolute inset-0 z-20 flex flex-col justify-end p-3 pointer-events-none">
                        <h3 className="font-bold text-white text-sm drop-shadow-md line-clamp-1">{getContentTitle(exhibition, lang)}</h3>
                        <p className="text-white/90 text-xs mt-0.5 line-clamp-1">{getContentDescription(exhibition, lang)}</p>
                        <div className="flex gap-3 mt-1 text-white/80 text-[10px]">
                          <span>{formatDateLocalized(exhibition.startDate, lang, 'short')}</span>
                          <span>{exhibition.registrations} чел.</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/20 pointer-events-auto min-w-0 flex-wrap">
                        {togglingStatusExhibitionId === exhibition.id ? (
                            <Button variant="default" size="sm" className="flex-1 min-w-0 h-8 text-xs rounded-md shadow-lg shrink-0" disabled>
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                              <span className="truncate">{t('saving')}</span>
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                className="flex-1 min-w-0 h-8 text-xs rounded-md shadow-lg shrink-0 px-2"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleExhibitionStatus(exhibition.id, exhibition.status); }}
                              >
                                <span className="truncate">{exhibition.status === 'published' ? t('unpublish') : t('publish')}</span>
                              </Button>
                              <Button
                                variant="default"
                                size="icon"
                                className="h-8 w-8 rounded-full shrink-0 shadow-lg flex-shrink-0"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditContent(exhibition, 'exhibition'); }}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 bg-black/30 backdrop-blur-[2px]">
                        <span className="rounded-full bg-white/95 p-3 shadow-xl">
                          <ExternalLink className="w-5 h-5 text-foreground" />
                        </span>
                      </div>
                      <Badge className="absolute top-2 right-2 z-30 text-[10px] px-1.5 py-0" variant={exhibition.status === 'published' ? 'default' : 'secondary'}>
                        {exhibition.status === 'draft' ? t('draftShort') : t('publishedShort')}
                      </Badge>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="w-full flex flex-col items-center justify-center py-24 min-h-[50vh]">
                  <LayoutGrid className="w-16 h-16 text-muted-foreground/50 mb-4" strokeWidth={1.25} />
                  <p className="text-lg font-medium text-muted-foreground">{t('notFound')}</p>
                </div>
              )}
            </TabsContent>

            {/* News Tab */}
            <TabsContent value="news" className="space-y-6 p-0 pt-6">
              <div className="flex flex-col sm:flex-row gap-4 pb-4 border-b border-border/60">
                <Input
                  placeholder={t('searchNews')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Button onClick={() => handleCreateContent('news')}>+ {t('newNews')}</Button>
              </div>

                {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <PublicationCardSkeleton key={i} />
                  ))}
                </div>
                ) : filteredNews.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {filteredNews.map((news) => (
                    <Card key={news.id} className="group overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 relative aspect-[2/3] w-full">
                      <a href={`/news/${news.id}`} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-0">
                        {news.image ? (
                          <img src={getImageUrl(news.image) || "/placeholder.svg"} alt={getContentTitle(news, lang)} className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 group-hover:blur-[3px] transition-all duration-500" loading="lazy" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/20 to-primary/20">
                            <span className="text-3xl font-bold text-muted-foreground/30">{(getContentTitle(news, lang) || '?').charAt(0)}</span>
                          </div>
                        )}
                      </a>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 from-30% via-black/20 to-transparent pointer-events-none z-10" />
                      <div className="absolute inset-0 z-20 flex flex-col justify-end p-3 pointer-events-none">
                        <h3 className="font-bold text-white text-sm drop-shadow-md line-clamp-1">{getContentTitle(news, lang)}</h3>
                        <p className="text-white/90 text-xs mt-0.5 line-clamp-2">{(getNewsContent(news, lang) ?? '').replace(/<[^>]*>/g, '').slice(0, 100)}</p>
                        <p className="text-white/80 text-[10px] mt-1">
                          {formatDateLocalized(news.publishedAt, lang, 'long')}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/20 pointer-events-auto min-w-0 flex-wrap">
                        {togglingStatusNewsId === news.id ? (
                            <Button variant="default" size="sm" className="flex-1 min-w-0 h-8 text-xs rounded-md shadow-lg shrink-0" disabled>
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                              <span className="truncate">{t('saving')}</span>
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                className="flex-1 min-w-0 h-8 text-xs rounded-md shadow-lg shrink-0 px-2"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleNewsStatus(news.id, news.status); }}
                              >
                                <span className="truncate">{news.status === 'published' ? t('unpublish') : t('publish')}</span>
                              </Button>
                              <Button
                                variant="default"
                                size="icon"
                                className="h-8 w-8 rounded-full shrink-0 shadow-lg flex-shrink-0"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditContent(news, 'news'); }}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 bg-black/30 backdrop-blur-[2px]">
                        <span className="rounded-full bg-white/95 p-3 shadow-xl">
                          <ExternalLink className="w-5 h-5 text-foreground" />
                        </span>
                      </div>
                      <Badge className="absolute top-2 right-2 z-30 text-[10px] px-1.5 py-0" variant={news.status === 'published' ? 'default' : 'secondary'}>
                        {news.status === 'draft' ? t('draftShort') : t('publishedShort')}
                      </Badge>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="w-full flex flex-col items-center justify-center py-24 min-h-[50vh]">
                  <LayoutGrid className="w-16 h-16 text-muted-foreground/50 mb-4" strokeWidth={1.25} />
                  <p className="text-lg font-medium text-muted-foreground">{t('notFound')}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Modal for Creating/Editing */}
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem
                    ? (modalType === 'exhibition' ? t('editExhibition') : t('editNews'))
                    : (modalType === 'exhibition' ? t('createExhibition') : t('createNews'))}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Tabs defaultValue="main" className="w-full space-y-0">
                  <div>
                    <TabsList className="h-auto w-full rounded-none bg-transparent p-0 gap-4 sm:gap-6 shadow-none min-h-0 pb-0 grid grid-cols-4">
                      <TabsTrigger
                        value="main"
                        className="group relative rounded-none bg-transparent px-0 pt-3 pb-0 text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 flex flex-col items-center col-span-1"
                      >
                        <span className="inline-block">
                          {t('tabMain')}
                          <span className="block w-full h-[3px] rounded-full bg-primary opacity-0 group-data-[state=active]:opacity-100 mt-0 shrink-0" aria-hidden />
                        </span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="ru"
                        className="group relative rounded-none bg-transparent px-0 pt-3 pb-0 text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 flex flex-col items-center col-span-1"
                      >
                        <span className="inline-block">
                          {t('tabLangRu')}
                          <span className="block w-full h-[3px] rounded-full bg-primary opacity-0 group-data-[state=active]:opacity-100 mt-0 shrink-0" aria-hidden />
                        </span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="uz"
                        className="group relative rounded-none bg-transparent px-0 pt-3 pb-0 text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 flex flex-col items-center col-span-1"
                      >
                        <span className="inline-block">
                          {t('tabLangUz')}
                          <span className="block w-full h-[3px] rounded-full bg-primary opacity-0 group-data-[state=active]:opacity-100 mt-0 shrink-0" aria-hidden />
                        </span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="en"
                        className="group relative rounded-none bg-transparent px-0 pt-3 pb-0 text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 flex flex-col items-center col-span-1"
                      >
                        <span className="inline-block">
                          {t('tabLangEn')}
                          <span className="block w-full h-[3px] rounded-full bg-primary opacity-0 group-data-[state=active]:opacity-100 mt-0 shrink-0" aria-hidden />
                        </span>
                      </TabsTrigger>
                    </TabsList>
                    <div className="h-[3px] -mt-[3px] flex items-end">
                      <div className="w-full h-px bg-border rounded-full" aria-hidden />
                    </div>
                  </div>

                  {/* Вкладка «Основное»: картинки, даты, место, города, участники */}
                  <TabsContent value="main" className="space-y-4 pt-6">
                    <div>
                      <label className="text-sm font-medium">{t('image')}</label>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-1">{t('bannerCardHint')}</p>
                      <div className="mt-1 flex flex-wrap items-start gap-3">
                        {(pendingBannerPreviewUrl || formData.banner || formData.image) ? (
                          <div className="flex flex-col gap-2 w-36">
                            <img
                              src={pendingBannerPreviewUrl ?? getImageUrl(formData.banner ?? formData.image)}
                              alt=""
                              className="h-36 w-36 rounded-lg object-cover border"
                              loading="lazy"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="w-full min-w-0"
                              onClick={() => {
                                setFormData({ ...formData, banner: '', image: '' })
                                setPendingBannerFile(null)
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-1.5" />
                              {t('deleteImage')}
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
                                setUploadError(`${t('fileTooLargeMax')} ${MAX_FILE_MB} ${t('mb')}`)
                                e.target.value = ''
                                return
                              }
                              setPendingBannerFile(file)
                              e.target.value = ''
                            }}
                          />
                          <span className="text-sm text-primary hover:underline">{t('chooseFile')}</span>
                          <span className="text-xs text-muted-foreground ml-1">(макс. {MAX_FILE_MB} МБ)</span>
                        </label>
                        {uploadError ? <p className="text-sm text-destructive mt-1">{uploadError}</p> : null}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t('image')} (до {MAX_IMAGES})</label>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-1">{t('imagesOnPageHint')}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {(formData.images ?? []).map((url: string, idx: number) => (
                          <div key={idx} className="relative group">
                            <img src={getImageUrl(url)} alt="" className="h-20 w-20 rounded-lg object-cover border" loading="lazy" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-1 -right-1 h-6 w-6 rounded-full opacity-90 group-hover:opacity-100"
                              onClick={() => setFormData({ ...formData, images: (formData.images ?? []).filter((_: string, i: number) => i !== idx) })}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        {pendingImagesFiles.map((file, idx) => (
                          <div key={`pending-${idx}`} className="relative group">
                            <img src={URL.createObjectURL(file)} alt="" className="h-20 w-20 rounded-lg object-cover border" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-1 -right-1 h-6 w-6 rounded-full opacity-90"
                              onClick={() => setPendingImagesFiles((prev) => prev.filter((_, i) => i !== idx))}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        {(formData.images ?? []).length + pendingImagesFiles.length < MAX_IMAGES && (
                          <label className="h-20 w-20 flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/40 hover:border-primary/50 cursor-pointer text-muted-foreground text-xs">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              multiple
                              disabled={saving}
                              onChange={(e) => {
                                const files = Array.from(e.target.files ?? [])
                                e.target.value = ''
                                setUploadError(null)
                                const added: File[] = []
                                for (const file of files) {
                                  if (file.size > MAX_FILE_MB * 1024 * 1024) {
                                    setUploadError(`${file.name}: ${t('fileTooLargeMax')} ${MAX_FILE_MB} ${t('mb')}`)
                                    continue
                                  }
                                  added.push(file)
                                }
                                setPendingImagesFiles((prev) => prev.concat(added).slice(0, MAX_IMAGES))
                              }}
                            />
                            + {t('addImage')}
                          </label>
                        )}
                      </div>
                    </div>
                    {modalType === 'exhibition' ? (
                      <>
                        <div>
                          <label className="text-sm font-medium">{t('cities')}</label>
                          <p className="text-xs text-muted-foreground mt-0.5 mb-1">{t('citiesMultiHint')}</p>
                          <div className="relative" ref={citiesDropdownRef}>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full justify-between font-normal"
                              disabled={citiesListLoading}
                              onClick={() => setCitiesDropdownOpen((v) => !v)}
                            >
                              {citiesListLoading ? t('loading') : (formData.cities ?? []).length ? `${t('selectedCount')}: ${(formData.cities ?? []).length}` : t('selectCities')}
                              <ChevronDown className={cn('ml-2 h-4 w-4 opacity-50 transition-transform', citiesDropdownOpen && 'rotate-180')} />
                            </Button>
                            {citiesDropdownOpen && (
                              <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-popover p-2 shadow-md">
                                <div className="max-h-60 overflow-y-auto overflow-x-hidden">
                                  {citiesList.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-2">{t('noCitiesHint')}</p>
                                  ) : (
                                    <div className="space-y-1">
                                      {citiesList.map((city) => (
                                        <label
                                          key={city.id}
                                          className={cn(
                                            'flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer',
                                            (formData.cities ?? []).includes(city.id) ? 'bg-primary/20 text-primary' : 'hover:bg-accent'
                                          )}
                                        >
                                          <Checkbox
                                            checked={(formData.cities ?? []).includes(city.id)}
                                            onCheckedChange={() => toggleCity(city.id)}
                                          />
                                          <span className="text-sm">{getCityName(city, lang)}</span>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(formData.cities ?? []).map((id: string) => {
                              const city = citiesList.find((c) => c.id === id)
                              const name = city ? getCityName(city, lang) : id
                              return (
                                <Badge key={id} variant="default" className="cursor-pointer hover:bg-primary/90" onClick={() => removeCity(id)}>
                                  {name} ×
                                </Badge>
                              )
                            })}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">{t('selectParticipants')}</label>
                          <p className="text-xs text-muted-foreground mt-0.5 mb-1">{t('participantsMultiHint')}</p>
                          <div className="relative" ref={participantsDropdownRef}>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full justify-between font-normal"
                              disabled={exhibitorsListLoading}
                              onClick={() => setParticipantsDropdownOpen((v) => !v)}
                            >
                              {exhibitorsListLoading ? t('loading') : (formData.participants ?? []).length ? `${t('selectedCount')}: ${(formData.participants ?? []).length}` : t('selectParticipants')}
                              <ChevronDown className={cn('ml-2 h-4 w-4 opacity-50 transition-transform', participantsDropdownOpen && 'rotate-180')} />
                            </Button>
                            {participantsDropdownOpen && (
                              <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-popover p-2 shadow-md">
                                <div className="max-h-60 overflow-y-auto overflow-x-hidden">
                                  {exhibitorsList.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-2">{t('noExhibitorsHint')}</p>
                                  ) : (
                                    <div className="space-y-1">
                                      {exhibitorsList.map((exh) => (
                                        <label
                                          key={exh.id}
                                          className={cn(
                                            'flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer',
                                            (formData.participants ?? []).includes(exh.id) ? 'bg-primary/20 text-primary' : 'hover:bg-accent'
                                          )}
                                        >
                                          <Checkbox
                                            checked={(formData.participants ?? []).includes(exh.id)}
                                            onCheckedChange={() => toggleParticipant(exh.id)}
                                          />
                                          <span className="text-sm">{exh.name}</span>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(formData.participants ?? []).map((id: string) => {
                              const exh = exhibitorsList.find((e) => e.id === id)
                              const name = exh?.name ?? id
                              return (
                                <Badge key={id} variant="default" className="cursor-pointer hover:bg-primary/90" onClick={() => removeParticipant(id)}>
                                  {name} ×
                                </Badge>
                              )
                            })}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">{t('startDate')}</label>
                            <Input
                              type="date"
                              value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">{t('endDate')}</label>
                            <Input
                              type="date"
                              value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="text-sm font-medium">{t('publicationDate')}</label>
                        <Input
                          type="date"
                          value={formData.publishedAt ? new Date(formData.publishedAt).toISOString().split('T')[0] : ''}
                          onChange={(e) => setFormData({ ...formData, publishedAt: new Date(e.target.value) })}
                        />
                      </div>
                    )}
                  </TabsContent>

                  {/* Вкладка RU: название, описание/контент, краткое описание */}
                  <TabsContent value="ru" className="space-y-4 pt-6">
                    <div>
                      <label className="text-sm font-medium">{t('title')} (RU) *</label>
                      <Input value={formData.titleRu ?? formData.title ?? ''} onChange={(e) => setFormData({ ...formData, titleRu: e.target.value })} placeholder={t('enterTitle')} />
                    </div>
                    {modalType === 'exhibition' ? (
                      <>
                        <div>
                          <label className="text-sm font-medium">{t('description')} (RU) *</label>
                          <Textarea value={formData.descriptionRu ?? formData.description ?? ''} onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })} placeholder={t('enterExhibitionDescription')} rows={4} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">{t('venueLabel')} (RU)</label>
                          <Input value={formData.venueRu ?? ''} onChange={(e) => setFormData({ ...formData, venueRu: e.target.value })} placeholder={t('enterVenue')} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium">{t('fullText')} (RU) *</label>
                          <Textarea value={formData.contentRu ?? formData.content ?? ''} onChange={(e) => setFormData({ ...formData, contentRu: e.target.value })} placeholder={t('enterNewsContent')} rows={4} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">{t('excerptRu')}</label>
                          <Textarea value={formData.excerptRu ?? formData.excerpt ?? ''} onChange={(e) => setFormData({ ...formData, excerptRu: e.target.value })} placeholder={t('excerptPlaceholder')} rows={2} />
                        </div>
                      </>
                    )}
                  </TabsContent>

                  {/* Вкладка UZ */}
                  <TabsContent value="uz" className="space-y-4 pt-6">
                    <div>
                      <label className="text-sm font-medium">{t('title')} (UZ) *</label>
                      <Input value={formData.titleUz ?? ''} onChange={(e) => setFormData({ ...formData, titleUz: e.target.value })} placeholder={t('enterTitle')} />
                    </div>
                    {modalType === 'exhibition' ? (
                      <>
                        <div>
                          <label className="text-sm font-medium">{t('description')} (UZ) *</label>
                          <Textarea value={formData.descriptionUz ?? ''} onChange={(e) => setFormData({ ...formData, descriptionUz: e.target.value })} placeholder={t('enterExhibitionDescription')} rows={4} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">{t('venueLabel')} (UZ)</label>
                          <Input value={formData.venueUz ?? ''} onChange={(e) => setFormData({ ...formData, venueUz: e.target.value })} placeholder={t('enterVenue')} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium">{t('fullText')} (UZ) *</label>
                          <Textarea value={formData.contentUz ?? ''} onChange={(e) => setFormData({ ...formData, contentUz: e.target.value })} placeholder={t('enterNewsContent')} rows={4} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">{t('excerptUz')}</label>
                          <Textarea value={formData.excerptUz ?? ''} onChange={(e) => setFormData({ ...formData, excerptUz: e.target.value })} placeholder={t('excerptPlaceholder')} rows={2} />
                        </div>
                      </>
                    )}
                  </TabsContent>

                  {/* Вкладка EN */}
                  <TabsContent value="en" className="space-y-4 pt-6">
                    <div>
                      <label className="text-sm font-medium">{t('title')} (EN) *</label>
                      <Input value={formData.titleEn ?? ''} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} placeholder={t('enterTitle')} />
                    </div>
                    {modalType === 'exhibition' ? (
                      <>
                        <div>
                          <label className="text-sm font-medium">{t('description')} (EN) *</label>
                          <Textarea value={formData.descriptionEn ?? ''} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} placeholder={t('enterExhibitionDescription')} rows={4} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">{t('venueLabel')} (EN)</label>
                          <Input value={formData.venueEn ?? ''} onChange={(e) => setFormData({ ...formData, venueEn: e.target.value })} placeholder={t('enterVenue')} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium">{t('fullText')} (EN) *</label>
                          <Textarea value={formData.contentEn ?? ''} onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })} placeholder={t('enterNewsContent')} rows={4} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">{t('excerptEn')}</label>
                          <Textarea value={formData.excerptEn ?? ''} onChange={(e) => setFormData({ ...formData, excerptEn: e.target.value })} placeholder={t('excerptPlaceholder')} rows={2} />
                        </div>
                      </>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setModalOpen(false)} disabled={saving}>
                    {t('cancel')}
                  </Button>
                  <Button className="flex-1" onClick={handleSaveContent} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('saving')}
                      </>
                    ) : (
                      t('save')
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
