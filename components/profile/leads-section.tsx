'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useAdmin } from '@/lib/admin-context'
import { useLocale } from '@/lib/i18n'
import { leadsApi, type ApiLeadRow, type ApiLeadsResponse } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Filter, Download, ChevronLeft, ChevronRight, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const ROWS_PER_PAGE_OPTIONS = [10, 19, 25, 50, 100]

function escapeCsvCell(s: string): string {
  const str = String(s ?? '')
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

function downloadCsv(rows: ApiLeadRow[], columns: { key: keyof ApiLeadRow; label: string }[]) {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(',')
  const lines = [header, ...rows.map((r) => columns.map((c) => escapeCsvCell(String(r[c.key] ?? ''))).join(','))]
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

export function LeadsSection() {
  const { user } = useAuth()
  const { exhibitions: allExhibitions } = useAdmin()
  const { t } = useLocale()
  const isExhibitor = user?.role === 'exhibitor'
  const exhibitorExhibitionIds = allExhibitions
    .filter((e) => (e.participants ?? []).some((p) => (typeof p === 'object' ? p.id : p) === user?.id))
    .map((e) => e.id)

  const [data, setData] = useState<ApiLeadsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(19)
  const [search, setSearch] = useState('')
  const [exhibitionIds, setExhibitionIds] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('__all__')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [appliedExhibitionIds, setAppliedExhibitionIds] = useState<string[]>([])
  const [appliedStatus, setAppliedStatus] = useState('__all__')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchLeads = useCallback(async () => {
    if (!isExhibitor || exhibitorExhibitionIds.length === 0) {
      setData({ items: [], total: 0, page: 1, rowsPerPage: 19, totalPages: 0 })
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await leadsApi.list({
        page,
        rowsPerPage,
        search: appliedSearch || undefined,
        exhibitionIds: appliedExhibitionIds.length ? appliedExhibitionIds : undefined,
        status: appliedStatus === '__all__' ? undefined : appliedStatus || undefined,
      })
      setData(res)
    } catch {
      setData({ items: [], total: 0, page: 1, rowsPerPage: 19, totalPages: 0 })
    } finally {
      setLoading(false)
    }
  }, [isExhibitor, exhibitorExhibitionIds.length, page, rowsPerPage, appliedSearch, appliedExhibitionIds, appliedStatus])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const applyFilters = () => {
    setAppliedSearch(search)
    setAppliedExhibitionIds(exhibitionIds)
    setAppliedStatus(statusFilter)
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setExhibitionIds([])
    setStatusFilter('__all__')
    setAppliedSearch('')
    setAppliedExhibitionIds([])
    setAppliedStatus('__all__')
    setPage(1)
  }
  const activeFilterCount = [!!appliedSearch, appliedExhibitionIds.length > 0, appliedStatus !== '__all__'].filter(Boolean).length

  const handleExport = async () => {
    try {
      const res = await leadsApi.list({
        page: 1,
        rowsPerPage: 10000,
        search: appliedSearch || undefined,
        exhibitionIds: appliedExhibitionIds.length ? appliedExhibitionIds : undefined,
        status: appliedStatus === '__all__' ? undefined : appliedStatus || undefined,
      })
      const columns: { key: keyof ApiLeadRow; label: string }[] = [
        { key: 'name', label: t('nameColumn') },
        { key: 'email', label: t('email') },
        { key: 'phone', label: t('phoneColumn') },
        { key: 'city', label: t('city') },
        { key: 'exhibitionTitle', label: t('exhibitionColumn') },
        { key: 'status', label: t('filterByStatus') },
      ]
      const statusLabels: Record<string, string> = {
        registered: t('statusRegistered'),
        visited: t('statusVisited'),
      }
      const rows = res.items.map((r) => ({
        ...r,
        status: statusLabels[r.status] ?? r.status,
      })) as ApiLeadRow[]
      downloadCsv(rows, columns)
    } catch {
      // ignore
    }
  }

  const toggleSelectAll = () => {
    if (!data?.items.length) return
    if (selectedIds.size === data.items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.items.map((r) => r.id)))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const statusLabel = (status: 'registered' | 'visited') =>
    status === 'visited' ? t('statusVisited') : t('statusRegistered')

  if (!isExhibitor) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Раздел лидов доступен только для университетов-участников выставок.
      </div>
    )
  }

  if (exhibitorExhibitionIds.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Ваш университет пока не участвует ни в одной выставке. Лиды появятся после добавления в участники выставок.
      </div>
    )
  }

  const totalPages = data?.totalPages ?? 1
  const safePage = Math.min(page, totalPages)

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex flex-1 min-h-0 gap-4">
        {/* Left filters panel */}
        <aside className="w-64 shrink-0 border-r border-border bg-muted/20 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {t('filters')}
            </span>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('searchPlaceholder').split('...')[0]}</label>
              <Input
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('filterByExhibitions')}</label>
              <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                {allExhibitions
                  .filter((e) => exhibitorExhibitionIds.includes(e.id))
                  .map((e) => (
                    <label key={e.id} className="flex items-center gap-2 cursor-pointer text-sm">
                      <Checkbox
                        checked={exhibitionIds.includes(e.id)}
                        onCheckedChange={(checked) => {
                          setExhibitionIds((prev) =>
                            checked ? [...prev, e.id] : prev.filter((id) => id !== e.id),
                          )
                        }}
                      />
                      <span className="truncate">{e.title}</span>
                    </label>
                  ))}
              </div>
              {exhibitionIds.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">Выбрано: {exhibitionIds.length}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('filterByStatus')}</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={t('allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{t('allStatuses')}</SelectItem>
                  <SelectItem value="registered">{t('statusRegistered')}</SelectItem>
                  <SelectItem value="visited">{t('statusVisited')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="p-4 border-t border-border space-y-2 mt-auto">
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={clearFilters}>
              {t('clearFilters')} {activeFilterCount ? `(${activeFilterCount})` : ''}
            </Button>
            <Button className="w-full" size="sm" onClick={applyFilters}>
              {t('applyFilter')}
            </Button>
          </div>
        </aside>

        {/* Main table area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-end gap-2 py-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              {t('exportToExcel')}
            </Button>
          </div>
          <div className="flex-1 border rounded-lg overflow-auto bg-card">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">{t('loading')}</div>
            ) : !data?.items.length ? (
              <div className="p-8 text-center text-muted-foreground">Нет лидов по заданным фильтрам.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={data.items.length > 0 && selectedIds.size === data.items.length}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Выбрать все"
                      />
                    </TableHead>
                    <TableHead>{t('nameColumn')}</TableHead>
                    <TableHead>{t('email')}</TableHead>
                    <TableHead>{t('phoneColumn')}</TableHead>
                    <TableHead>{t('city')}</TableHead>
                    <TableHead>{t('filterByStatus')}</TableHead>
                    <TableHead>{t('exhibitionColumn')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(row.id)}
                          onCheckedChange={() => toggleSelect(row.id)}
                          aria-label={`Выбрать ${row.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium">{row.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.phone || '—'}</TableCell>
                      <TableCell>{row.city || '—'}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
                            row.status === 'visited'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {statusLabel(row.status)}
                        </span>
                      </TableCell>
                      <TableCell>{row.exhibitionTitle || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {data && data.total > 0 && (
            <div className="flex items-center justify-between py-3 px-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{t('rowsPerPage')}</span>
                <Select
                  value={String(rowsPerPage)}
                  onValueChange={(v) => {
                    setRowsPerPage(Number(v))
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROWS_PER_PAGE_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>
                  {t('pagesOf').replace('{page}', String(safePage)).replace('{total}', String(totalPages))}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
