'use client'

import { useState, useEffect, useRef } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { useLocale } from '@/lib/i18n'
import {
  landingPartnersApi,
  getImageUrl,
  invalidateLandingPartnersPublicClientCache,
  landingPartnerLogoSrc,
  type ApiLandingPartner,
} from '@/lib/api'
import { preloadPartnerImages } from '@/lib/partner-images-batch'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Loader2, Trash2, Pencil, ExternalLink } from 'lucide-react'

const MAX_FILE_MB = 10

function LandingAdminContent() {
  const { t } = useLocale()
  const [list, setList] = useState<ApiLandingPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ApiLandingPartner | null>(null)
  const [href, setHref] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await landingPartnersApi.list()
      setList(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (list.length === 0) return
    preloadPartnerImages(
      list.map((p) => landingPartnerLogoSrc(p)),
      5,
      50,
    )
  }, [list])

  useEffect(() => {
    if (!file) {
      setPreviewUrl((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
        return null
      })
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const openCreate = () => {
    setEditing(null)
    setHref('')
    setFile(null)
    setError(null)
    setModalOpen(true)
    fileInputRef.current && (fileInputRef.current.value = '')
  }

  const openEdit = (p: ApiLandingPartner) => {
    setEditing(p)
    setHref(p.href)
    setFile(null)
    setPreviewUrl(null)
    setError(null)
    setModalOpen(true)
    fileInputRef.current && (fileInputRef.current.value = '')
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setHref('')
    setFile(null)
    setPreviewUrl(null)
  }

  const handleSave = async () => {
    const h = href.trim()
    if (!h) {
      setError(t('adminLandingPartnerHref'))
      return
    }
    if (!editing && !file) {
      setError(t('adminLandingPartnerLogo'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        if (file) {
          await landingPartnersApi.update(editing.id, { href: h, logo: file })
        } else {
          await landingPartnersApi.update(editing.id, { href: h })
        }
      } else if (file) {
        await landingPartnersApi.create(h, file)
      }
      invalidateLandingPartnersPublicClientCache()
      closeModal()
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('adminLandingPartnerDeleteConfirm'))) return
    setDeletingId(id)
    try {
      await landingPartnersApi.delete(id)
      invalidateLandingPartnersPublicClientCache()
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('error'))
    } finally {
      setDeletingId(null)
    }
  }

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) {
      setFile(null)
      return
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`${t('fileTooLargeMax')} ${MAX_FILE_MB} ${t('mb')}`)
      e.target.value = ''
      setFile(null)
      return
    }
    setFile(f)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-64 pt-14 lg:pt-0">
      <AdminSidebar />
      <main className="mx-auto max-w-[min(100%,96rem)] p-4 lg:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('landing')}</h1>

        <Tabs defaultValue="partners" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="partners">{t('adminLandingPartnersTab')}</TabsTrigger>
          </TabsList>
          <TabsContent value="partners">
            <div className="flex justify-end mb-4">
              <Button onClick={openCreate} className="gap-2">
                <Plus className="size-4" />
                {t('adminLandingPartnerCreate')}
              </Button>
            </div>

            {error && !modalOpen && (
              <p className="text-sm text-red-600 mb-4" role="alert">
                {error}
              </p>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : list.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">{t('adminLandingPartnersEmpty')}</CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                {list.map((p) => (
                  <Card key={p.id} className="overflow-hidden">
                    <CardContent className="flex flex-col gap-1.5 p-2">
                      <div className="flex h-14 items-center justify-center rounded-md border bg-white p-1">
                        <img
                          src={landingPartnerLogoSrc(p)}
                          alt=""
                          className="max-h-12 max-w-full object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-8 items-center gap-0.5 text-xs text-primary hover:underline"
                        title={p.href}
                      >
                        <span className="min-w-0 flex-1 truncate">{p.href}</span>
                        <ExternalLink className="size-3 shrink-0" aria-hidden />
                      </a>
                      <div className="mt-auto flex justify-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-8 shrink-0"
                          aria-label={t('adminLandingPartnerEdit')}
                          title={t('adminLandingPartnerEdit')}
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="size-3.5" aria-hidden />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="size-8 shrink-0"
                          aria-label={t('delete')}
                          title={t('delete')}
                          disabled={deletingId === p.id}
                          onClick={() => handleDelete(p.id)}
                        >
                          {deletingId === p.id ? (
                            <Loader2 className="size-3.5 animate-spin" aria-hidden />
                          ) : (
                            <Trash2 className="size-3.5" aria-hidden />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={modalOpen} onOpenChange={(o) => !o && closeModal()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? t('adminLandingPartnerEdit') : t('adminLandingPartnerCreate')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="lp-href">{t('adminLandingPartnerHref')}</Label>
                <Input
                  id="lp-href"
                  type="url"
                  placeholder="https://"
                  value={href}
                  onChange={(e) => setHref(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium leading-none">{t('adminLandingPartnerLogo')}</div>
                <label htmlFor="lp-logo" className="inline-flex cursor-pointer flex-wrap items-baseline gap-x-1">
                  <input
                    ref={fileInputRef}
                    id="lp-logo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    disabled={saving}
                    onChange={onPickFile}
                  />
                  <span className="text-sm text-primary hover:underline">{t('chooseFile')}</span>
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({MAX_FILE_MB} {t('mb')})
                  </span>
                </label>
                <p className="text-xs text-muted-foreground">{t('adminLandingPartnerLogoHint')}</p>
                {editing && !file && (
                  <div className="h-20 rounded-md border bg-white flex items-center justify-center p-2">
                    <img
                      src={landingPartnerLogoSrc(editing)}
                      alt=""
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
                {previewUrl && (
                  <div className="h-20 rounded-md border bg-white flex items-center justify-center p-2">
                    <img src={previewUrl} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
              </div>
              {error && modalOpen && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeModal}>
                  {t('cancel')}
                </Button>
                <Button type="button" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : t('save')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

export default function AdminLandingPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'content_manager']}>
      <LandingAdminContent />
    </ProtectedRoute>
  )
}
