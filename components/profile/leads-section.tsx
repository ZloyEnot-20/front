'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
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
import { Filter, Download, ArrowUpDown, User, Building2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const ROWS_PER_PAGE_OPTIONS = [10, 19, 25, 50, 100]

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-red-500',
  'bg-amber-500',
  'bg-green-500',
  'bg-teal-500',
  'bg-indigo-500',
]

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(name: string) {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length]
}

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

type SortKey = 'name' | 'email' | 'phone' | 'city' | 'status' | 'exhibitionTitle'

function DataTable({
  data,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onSort,
  sortConfig,
  statusLabel,
}: {
  data: ApiLeadRow[]
  selectedIds: Set<string>
  onSelectAll: (checked: boolean) => void
  onSelectRow: (id: string) => void
  onSort: (key: SortKey) => void
  sortConfig: { key: SortKey; direction: 'asc' | 'desc' } | null
  statusLabel: (s: 'registered' | 'visited') => string
}) {
  const { t } = useLocale()
  const allSelected = data.length > 0 && selectedIds.size === data.length

  const SortHeader = ({ column, label }: { column: SortKey; label: string }) => (
    <button
      type="button"
      onClick={() => onSort(column)}
      className="flex items-center gap-1 hover:text-primary transition font-medium text-sm text-left"
    >
      {label}
      <ArrowUpDown
        size={14}
        className={cn(
          'transition shrink-0',
          sortConfig?.key === column ? 'text-primary opacity-100' : 'text-muted-foreground opacity-50',
        )}
      />
    </button>
  )

  const sortedData = useMemo(() => {
    if (!sortConfig) return data
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? ''
      const bVal = b[sortConfig.key] ?? ''
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' })
      return sortConfig.direction === 'asc' ? cmp : -cmp
    })
  }, [data, sortConfig])

  return (
    <div className="w-full">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(v) => onSelectAll(v === true)}
                aria-label="Выбрать все"
                className="rounded"
              />
            </th>
            <th className="px-4 py-3 text-left">
              <SortHeader column="name" label={t('nameColumn')} />
            </th>
            <th className="px-4 py-3 text-left">
              <SortHeader column="email" label={t('email')} />
            </th>
            <th className="px-4 py-3 text-left">
              <SortHeader column="phone" label={t('phoneColumn')} />
            </th>
            <th className="px-4 py-3 text-left">
              <SortHeader column="city" label={t('city')} />
            </th>
            <th className="px-4 py-3 text-left">
              <SortHeader column="status" label={t('filterByStatus')} />
            </th>
            <th className="px-4 py-3 text-left">
              <SortHeader column="exhibitionTitle" label={t('exhibitionColumn')} />
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => (
            <tr key={row.id} className="border-b border-border hover:bg-muted/30 transition">
              <td className="px-4 py-3">
                <Checkbox
                  checked={selectedIds.has(row.id)}
                  onCheckedChange={() => onSelectRow(row.id)}
                  aria-label={row.name}
                  className="rounded"
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0',
                      getAvatarColor(row.name),
                    )}
                  >
                    {getInitials(row.name) || '?'}
                  </div>
                  <span className="font-medium text-foreground">{row.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-foreground">{row.email}</td>
              <td className="px-4 py-3 text-foreground">{row.phone || '—'}</td>
              <td className="px-4 py-3 text-foreground">{row.city || '—'}</td>
              <td className="px-4 py-3">
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
              </td>
              <td className="px-4 py-3 text-foreground">{row.exhibitionTitle || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function LeadsSection() {
  const { user } = useAuth()
  const { exhibitions: allExhibitions } = useAdmin()
  const { t } = useLocale()
  const isExhibitor = user?.role === 'exhibitor'
  const exhibitorExhibitionIds = allExhibitions
    .filter((e) => (e.participants ?? []).some((p) => (typeof p === 'object' ? p.id : p) === user?.id))
    .map((e) => e.id)
  const exhibitorExhibitions = allExhibitions.filter((e) => exhibitorExhibitionIds.includes(e.id))

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
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null)

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

  const activeFilterCount = [!!appliedSearch, appliedExhibitionIds.length > 0, appliedStatus !== '__all__'].filter(
    Boolean,
  ).length

  const handleExport = async () => {
    try {
      const res = await leadsApi.list({
        page: 1,
        rowsPerPage: 10000,
        search: appliedSearch || undefined,
        exhibitionIds: appliedExhibitionIds.length ? appliedExhibitionIds : undefined,
        status: appliedStatus === '__all__' ? undefined : appliedStatus || undefined,
      })
      const statusLabels: Record<string, string> = {
        registered: t('statusRegistered'),
        visited: t('statusVisited'),
      }
      const columns: { key: keyof ApiLeadRow; label: string }[] = [
        { key: 'name', label: t('nameColumn') },
        { key: 'email', label: t('email') },
        { key: 'phone', label: t('phoneColumn') },
        { key: 'city', label: t('city') },
        { key: 'exhibitionTitle', label: t('exhibitionColumn') },
        { key: 'status', label: t('filterByStatus') },
      ]
      const rows = res.items.map((r) => ({
        ...r,
        status: statusLabels[r.status] ?? r.status,
      })) as ApiLeadRow[]
      downloadCsv(rows, columns)
    } catch {
      // ignore
    }
  }

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) =>
      prev?.key === key && prev.direction === 'asc' ? { key, direction: 'desc' } : { key, direction: 'asc' },
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (!data?.items.length) return
    setSelectedIds(checked ? new Set(data.items.map((r) => r.id)) : new Set())
  }

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const removeExhibitionFilter = (id: string) => {
    setExhibitionIds((prev) => prev.filter((x) => x !== id))
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
    <div className="flex flex-col h-full min-h-0 bg-background">
      <div className="flex flex-1 min-h-0 gap-4 overflow-hidden">
        {/* Sidebar — как в референсе */}
        <aside className="w-72 bg-card overflow-y-auto flex flex-col shrink-0 rounded-lg border border-border">
          <div className="p-6 space-y-6 flex-1">
            <div>
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {t('filters')}
              </h2>
            </div>

            {/* Name / Search */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-3 cursor-pointer">
                <User className="w-4 h-4 text-muted-foreground" />
                {t('nameColumn')}
              </label>
              <Input
                type="text"
                placeholder={t('searchPlaceholder')}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Выставки */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-3 cursor-pointer">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                {t('filterByExhibitions')}
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-lg p-2">
                {exhibitorExhibitions.map((e) => (
                  <label key={e.id} className="flex items-center gap-2 cursor-pointer text-sm">
                    <Checkbox
                      checked={exhibitionIds.includes(e.id)}
                      onCheckedChange={(checked) =>
                        setExhibitionIds((prev) =>
                          checked ? [...prev, e.id] : prev.filter((id) => id !== e.id),
                        )
                      }
                      className="rounded"
                    />
                    <span className="truncate">{e.title}</span>
                  </label>
                ))}
              </div>
              {exhibitionIds.length > 0 && (
                <div className="mt-3 p-2 bg-muted rounded flex flex-wrap gap-2">
                  {exhibitionIds.map((id) => {
                    const ex = exhibitorExhibitions.find((x) => x.id === id)
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 bg-background px-2 py-1 rounded text-xs border border-border"
                      >
                        {ex?.title ?? id}
                        <button
                          type="button"
                          onClick={() => removeExhibitionFilter(id)}
                          className="hover:text-destructive"
                          aria-label="Удалить"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Статус */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t('filterByStatus')}</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full px-3 py-2 text-sm border border-border rounded-lg h-auto">
                  <SelectValue placeholder={t('allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{t('allStatuses')}</SelectItem>
                  <SelectItem value="registered">{t('statusRegistered')}</SelectItem>
                  <SelectItem value="visited">{t('statusVisited')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={clearFilters}
              >
                {t('clearFilters')} {activeFilterCount ? `(${activeFilterCount})` : ''}
              </Button>
              <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={applyFilters}>
                {t('applyFilter')}
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content — вкладка и таблица как в референсе */}
        <div className="flex-1 flex flex-col bg-card rounded-lg border border-border overflow-hidden min-w-0">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <span className="pb-3 px-1 font-medium text-sm border-b-2 border-primary text-primary">
                  {t('leadsTab')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                  <Download size={16} />
                  {t('exportToExcel')}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-6 py-4">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">{t('loading')}</div>
            ) : !data?.items.length ? (
              <div className="p-8 text-center text-muted-foreground">Нет лидов по заданным фильтрам.</div>
            ) : (
              <DataTable
                data={data.items}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelectRow={handleSelectRow}
                onSort={handleSort}
                sortConfig={sortConfig}
                statusLabel={statusLabel}
              />
            )}
          </div>

          {/* Pagination — как на картинке */}
          {data && data.total > 0 && (
            <div className="border-t border-border px-6 py-4 flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {t('rowsPerPage')}{' '}
                <Select
                  value={String(rowsPerPage)}
                  onValueChange={(v) => {
                    setRowsPerPage(Number(v))
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-16 h-8 inline-flex">
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
              <div className="flex items-center gap-2">
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
