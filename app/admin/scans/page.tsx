'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { useLocale } from '@/lib/i18n'
import { scansApi, usersApi, type ApiScanLogItem, type ApiUser } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download } from 'lucide-react'

const PAGE_SIZE = 50
const FETCH_LIMIT = 500

function regStatusLabel(t: (k: string) => string, status?: string) {
  if (status === 'cancelled') return t('registrationStatusCancelled')
  if (status === 'registered') return t('registrationStatusRegistered')
  return status?.trim() ? status : '—'
}

const VISITOR_STATUS_CSV_KEYS: Record<string, string> = {
  student: 'statusStudent',
  parent: 'statusParent',
  specialist: 'statusSpecialist',
}

const ADMISSION_PLAN_CSV_KEYS: Record<string, string> = {
  '0-3': 'admissionPlan03',
  '3-6': 'admissionPlan36',
  '6-12': 'admissionPlan612',
}

function visitorStatusCsvLabel(t: (k: string) => string, v?: string) {
  if (!v?.trim()) return ''
  const key = VISITOR_STATUS_CSV_KEYS[v]
  return key ? t(key) : v
}

function admissionPlanCsvLabel(t: (k: string) => string, v?: string) {
  if (!v?.trim()) return ''
  const key = ADMISSION_PLAN_CSV_KEYS[v]
  return key ? t(key) : v
}

function scannerDisplay(log: ApiScanLogItem): string {
  const sb = log.scannedBy
  if (sb?.name?.trim()) return sb.name.trim()
  if (sb?.email?.trim()) return sb.email.trim()
  return log.scannedByUserId || '—'
}

function visitorDisplay(log: ApiScanLogItem): string {
  const r = log.registration
  if (!r) return '—'
  const name = `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim()
  if (name && r.email) return `${name} (${r.email})`
  if (name) return name
  return r.email || '—'
}

function ScansContent() {
  const { t, lang } = useLocale()
  const [exhibitors, setExhibitors] = useState<ApiUser[]>([])
  const [scans, setScans] = useState<ApiScanLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [scannerFilter, setScannerFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState<ApiScanLogItem | null>(null)

  useEffect(() => {
    usersApi
      .list({ role: 'exhibitor' })
      .then(setExhibitors)
      .catch(() => setExhibitors([]))
  }, [])

  const loadScans = useCallback(async () => {
    setLoading(true)
    try {
      const data = await scansApi.listAll({
        limit: FETCH_LIMIT,
        ...(scannerFilter !== 'all' ? { scannedByUserId: scannerFilter } : {}),
      })
      setScans(data)
    } catch {
      setScans([])
    } finally {
      setLoading(false)
    }
  }, [scannerFilter])

  useEffect(() => {
    loadScans()
  }, [loadScans])

  useEffect(() => {
    setPage(1)
  }, [scannerFilter])

  const totalPages = Math.max(1, Math.ceil(scans.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = useMemo(
    () => scans.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [scans, safePage]
  )

  const locale = lang === 'en' ? 'en-US' : lang === 'uz' ? 'uz-UZ' : 'ru-RU'
  const formatDt = (iso?: string) =>
    iso ? new Date(iso).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' }) : '—'

  const handleDownloadCSV = () => {
    if (scans.length === 0) return
    const delimiter = ';'
    const lineBreak = '\r\n'
    const escapeCell = (cell: unknown) => {
      const raw = String(cell ?? '')
      const normalized = raw.replace(/\r?\n/g, ' ').replace(/\u2028|\u2029/g, ' ')
      const escapedQuotes = normalized.replace(/"/g, '""')
      return `"${escapedQuotes}"`
    }
    const rows = scans.map((log) => {
      const r = log.registration
      return [
        scannerDisplay(log),
        r?.id ?? '',
        r?.userId ?? '',
        r?.firstName ?? '',
        r?.lastName ?? '',
        r?.email ?? '',
        r?.phone ?? '',
        r?.city ?? '',
        r != null ? regStatusLabel(t, r.status) : '',
        visitorStatusCsvLabel(t, r?.visitorStatus),
        r?.languageKnowledge ?? '',
        r?.interest ?? '',
        r?.countryOfInterest ?? '',
        admissionPlanCsvLabel(t, r?.admissionPlan),
        r?.registeredAt ? formatDt(r.registeredAt) : '',
        r?.scannedAt ? formatDt(r.scannedAt) : '',
      ]
    })
    const csv = [
      [
        t('scansExportUniversityColumn'),
        t('scansGuestRegistrationId'),
        t('scansExportGuestUserId'),
        t('firstNameLabel'),
        t('lastNameLabel'),
        t('emailLabel'),
        t('phoneLabelShort'),
        t('cityLabel'),
        t('filterByStatus'),
        t('scansExportGuestVisitorCategory'),
        t('languageKnowledge'),
        t('interestColumn'),
        t('countryOfInterestColumn'),
        t('admissionPlanColumn'),
        t('dateRegistered'),
        t('firstQrScanAt'),
      ],
      ...rows,
    ]
      .map((row) => row.map((cell) => escapeCell(cell)).join(delimiter))
      .join(lineBreak)
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `scans_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const canExportScans = !loading && scans.length > 0

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 pt-14 lg:pt-0 ml-0 lg:ml-64 min-h-screen min-w-0">
        <div className="border-b border-border/40 bg-white/50 backdrop-blur">
          <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{t('scans')}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t('scansPageSubtitle')}</p>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <Card className="mb-4 lg:mb-6">
            <CardContent className="pt-4 lg:pt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="w-full max-w-md space-y-2">
                <label className="text-sm font-medium block">{t('filterByUniversity')}</label>
                <Select value={scannerFilter} onValueChange={setScannerFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('allScanners')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allScanners')}</SelectItem>
                    {exhibitors.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name?.trim() || u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 shrink-0 self-start sm:self-auto"
                disabled={!canExportScans}
                onClick={handleDownloadCSV}
              >
                <Download size={16} />
                {t('downloadCsv')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">{t('loading')}</div>
              ) : (
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/50">
                      <th className="text-left p-3 lg:p-4 font-medium text-xs lg:text-sm text-muted-foreground">
                        {t('time')}
                      </th>
                      <th className="text-left p-3 lg:p-4 font-medium text-xs lg:text-sm text-muted-foreground">
                        {t('scanningParty')}
                      </th>
                      <th className="text-left p-3 lg:p-4 font-medium text-xs lg:text-sm text-muted-foreground">
                        {t('scannedVisitor')}
                      </th>
                      <th className="text-left p-3 lg:p-4 font-medium text-xs lg:text-sm text-muted-foreground">
                        {t('exhibitionFallback')}
                      </th>
                      <th className="text-left p-3 lg:p-4 font-medium text-xs lg:text-sm text-muted-foreground">
                        {t('status')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length > 0 ? (
                      paginated.map((log) => (
                        <tr
                          key={log.id}
                          className="border-b border-border/40 hover:bg-muted/30 cursor-pointer"
                          onClick={() => setDetail(log)}
                        >
                          <td className="p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground whitespace-nowrap">
                            {formatDt(log.scannedAt)}
                          </td>
                          <td className="p-3 lg:p-4 text-xs lg:text-sm">{scannerDisplay(log)}</td>
                          <td className="p-3 lg:p-4 text-xs lg:text-sm">{visitorDisplay(log)}</td>
                          <td className="p-3 lg:p-4 text-xs lg:text-sm">{log.exhibition?.title ?? '—'}</td>
                          <td className="p-3 lg:p-4">
                            {log.success ? (
                              <Badge className="bg-green-600">{t('success')}</Badge>
                            ) : (
                              <Badge className="bg-red-600">{t('error')}</Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground text-sm">
                          {t('noRecords')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-4">
            <p className="text-xs lg:text-sm text-muted-foreground">
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, scans.length)} / {scans.length}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                >
                  {t('back')}
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  {safePage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                >
                  {t('forward')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setDetail(null)
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('scanDetailsTitle')}</DialogTitle>
          </DialogHeader>
          {detail ? (
            <div className="space-y-4 text-sm">
              <div className="grid gap-1">
                <span className="text-muted-foreground">{t('time')}</span>
                <span className="font-medium">{formatDt(detail.scannedAt)}</span>
              </div>
              <div className="grid gap-1">
                <span className="text-muted-foreground">{t('status')}</span>
                <span>
                  {detail.success ? (
                    <Badge className="bg-green-600">{t('success')}</Badge>
                  ) : (
                    <Badge className="bg-red-600">{t('error')}</Badge>
                  )}
                </span>
              </div>
              {!detail.success && detail.errorMessage ? (
                <div className="grid gap-1">
                  <span className="text-muted-foreground">{t('action')}</span>
                  <span className="text-red-600">{detail.errorMessage}</span>
                </div>
              ) : null}
              <div className="grid gap-1">
                <span className="text-muted-foreground">{t('scanningParty')}</span>
                <span className="font-medium">{scannerDisplay(detail)}</span>
                {detail.scannedBy?.email ? (
                  <span className="text-muted-foreground text-xs">{detail.scannedBy.email}</span>
                ) : null}
                <span className="text-xs text-muted-foreground font-mono">{detail.scannedByUserId}</span>
              </div>
              <div className="grid gap-1">
                <span className="text-muted-foreground">{t('exhibitionFallback')}</span>
                <span>{detail.exhibition?.title ?? '—'}</span>
                {detail.exhibition?.id ? (
                  <span className="text-xs font-mono text-muted-foreground">{detail.exhibition.id}</span>
                ) : null}
              </div>
              {detail.registration ? (
                <div className="rounded-lg border border-border/60 p-3 space-y-2">
                  <p className="font-semibold">{t('scannedVisitor')}</p>
                  <div className="grid gap-1">
                    <span className="text-muted-foreground">{t('name')}</span>
                    <span>
                      {`${detail.registration.firstName ?? ''} ${detail.registration.lastName ?? ''}`.trim() || '—'}
                    </span>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-muted-foreground">{t('email')}</span>
                    <span>{detail.registration.email || '—'}</span>
                  </div>
                  {detail.registration.phone ? (
                    <div className="grid gap-1">
                      <span className="text-muted-foreground">{t('phone')}</span>
                      <span>{detail.registration.phone}</span>
                    </div>
                  ) : null}
                  <div className="grid gap-1">
                    <span className="text-muted-foreground">{t('cityLabel')}</span>
                    <span>{detail.registration.city || '—'}</span>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-muted-foreground">{t('status')}</span>
                    <span>{regStatusLabel(t, detail.registration.status)}</span>
                  </div>
                  {detail.registration.registeredAt ? (
                    <div className="grid gap-1">
                      <span className="text-muted-foreground">{t('dateRegistered')}</span>
                      <span>{formatDt(detail.registration.registeredAt)}</span>
                    </div>
                  ) : null}
                  {detail.registration.scannedAt ? (
                    <div className="grid gap-1">
                      <span className="text-muted-foreground">{t('firstQrScanAt')}</span>
                      <span>{formatDt(detail.registration.scannedAt)}</span>
                    </div>
                  ) : null}
                  <div className="grid gap-1">
                    <span className="text-muted-foreground">{t('scansGuestRegistrationId')}</span>
                    <span className="font-mono text-xs break-all">{detail.registration.id}</span>
                  </div>
                </div>
              ) : null}
              <div className="grid gap-1">
                <span className="text-muted-foreground">{t('scanRecordId')}</span>
                <span className="font-mono text-xs break-all">{detail.id}</span>
              </div>
              {detail.deviceId ? (
                <div className="grid gap-1">
                  <span className="text-muted-foreground">{t('scanDeviceId')}</span>
                  <span className="font-mono text-xs break-all">{detail.deviceId}</span>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminScansPage() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <ScansContent />
    </ProtectedRoute>
  )
}
