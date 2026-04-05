'use client'

import { useState, useEffect, useRef } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { useLocale } from '@/lib/i18n'
import { landingPartnersApi, getImageUrl, type ApiLandingPartner } from '@/lib/api'
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
      setError(`Максимум ${MAX_FILE_MB} МБ`)
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
      <main className="p-4 lg:p-8 max-w-5xl mx-auto">
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((p) => (
                  <Card key={p.id} className="overflow-hidden">
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="h-24 rounded-lg bg-white border flex items-center justify-center p-2">
                        <img
                          src={getImageUrl(p.logoFileId)}
                          alt=""
                          className="max-h-20 max-w-full object-contain"
                        />
                      </div>
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{p.href}</span>
                        <ExternalLink className="size-3 shrink-0" />
                      </a>
                      <div className="flex gap-2 mt-auto">
                        <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(p)}>
                          <Pencil className="size-3.5" />
                          {t('adminLandingPartnerEdit')}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deletingId === p.id}
                          onClick={() => handleDelete(p.id)}
                        >
                          {deletingId === p.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
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
                <Label htmlFor="lp-logo">{t('adminLandingPartnerLogo')}</Label>
                <input
                  ref={fileInputRef}
                  id="lp-logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="text-sm w-full"
                  onChange={onPickFile}
                />
                <p className="text-xs text-muted-foreground">{t('adminLandingPartnerLogoHint')}</p>
                {editing && !file && (
                  <div className="h-20 rounded-md border bg-white flex items-center justify-center p-2">
                    <img src={getImageUrl(editing.logoFileId)} alt="" className="max-h-full max-w-full object-contain" />
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
