'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Download, X, ArrowUpDown, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useAdmin } from '@/lib/admin-context'
import { useLocale } from '@/lib/i18n'
import { leadsApi, type ApiLeadRow, type ApiLeadsResponse } from '@/lib/api'

// Data Table Component — стили как в референсе, данные наши
function DataTable({ data, selectedIds, onSelectAll, onSelectRow, onSort, sortConfig, statusLabel }: any) {
  const allSelected = data.length > 0 && selectedIds.length === data.length

  const SortHeader = ({ column, label }: any) => (
    <button
      onClick={() => onSort(column)}
      className="flex items-center gap-1 hover:text-primary transition font-medium text-sm"
    >
      {label}
      <ArrowUpDown
        size={14}
        className={`transition ${
          sortConfig?.key === column
            ? 'text-primary opacity-100'
            : 'text-muted-foreground opacity-50'
        }`}
      />
    </button>
  )

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-teal-500',
      'bg-indigo-500',
    ]
    return colors[name.charCodeAt(0) % colors.length]
  }

  return (
    <div className="w-full">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded cursor-pointer w-4 h-4"
              />
            </th>
            <th className="px-4 py-3 text-left">
              <SortHeader column="name" label="Name" />
            </th>
            <th className="px-4 py-3 text-left">
              <SortHeader column="email" label="Email" />
            </th>
            <th className="px-4 py-3 text-left">
              <SortHeader column="phone" label="Phone Numbers" />
            </th>
            <th className="px-4 py-3 text-left">
              <SortHeader column="city" label="City" />
            </th>
            <th className="px-4 py-3 text-left">
              <SortHeader column="status" label="Status" />
            </th>
            <th className="px-4 py-3 text-left">
              <SortHeader column="exhibitionTitle" label="Exhibition" />
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row: any) => (
            <tr
              key={row.id}
              className="border-b border-border hover:bg-muted/30 transition"
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(row.id)}
                  onChange={() => onSelectRow(row.id)}
                  className="rounded cursor-pointer w-4 h-4"
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${getAvatarColor(
                      row.name
                    )} flex items-center justify-center text-white font-medium text-sm flex-shrink-0`}
                  >
                    {getInitials(row.name)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{row.name}</span>
                    <Linkedin size={14} className="text-muted-foreground" />
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-foreground">{row.email}</td>
              <td className="px-4 py-3 text-foreground">{row.phone || '—'}</td>
              <td className="px-4 py-3 text-foreground">{row.city || '—'}</td>
              <td className="px-4 py-3 text-foreground">{statusLabel ? statusLabel(row.status) : row.status}</td>
              <td className="px-4 py-3 text-foreground">{row.exhibitionTitle || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Sidebar — стили как в референсе, данные наши (name, выставки, статус)
function Sidebar({
  filters,
  setFilters,
  exhibitions,
  clearAllFilters,
  applyFilters,
  activeFilterCount,
  t,
}: any) {
  const handleRemoveExhibition = (id: string) => {
    setFilters((f: any) => ({ ...f, exhibitionIds: f.exhibitionIds.filter((x: string) => x !== id) }))
  }

  const handleToggleExhibition = (id: string, checked: boolean) => {
    setFilters((f: any) => ({
      ...f,
      exhibitionIds: checked
        ? [...f.exhibitionIds, id]
        : f.exhibitionIds.filter((x: string) => x !== id),
    }))
  }

  return (
    <div className="w-72 bg-card overflow-y-auto flex flex-col">
      <div className="p-6 space-y-6 flex-1">
        <div>
          <h2 className="font-semibold text-foreground mb-4">Filters</h2>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-muted rounded transition" type="button">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
            <button className="p-2 hover:bg-muted rounded transition" type="button">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Name Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-3 cursor-pointer">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
            Name
          </label>
          <input
            type="text"
            placeholder="Search name"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={filters.name}
            onChange={(e) => setFilters((f: any) => ({ ...f, name: e.target.value }))}
          />
        </div>

        {/* Exhibitions (вместо Title) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-3 cursor-pointer">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175c.075-.814.505-1.743 1.46-2.465C4.402 12.043 6.232 12 7 12c.78 0 2.598.043 4.494 1.788.955.722 1.385 1.651 1.46 2.465.034.382-.037.782-.263 1.022-.096.11-.238.203-.389.263a.417.417 0 01-.26.027A13.20 13.20 0 0114 16h-3a4 4 0 01-4-4v-.5a2 2 0 00-2-2h-1.217C.083 10.36 0 10.649 0 11v5a4 4 0 004 4h4a4 4 0 003.957-3.572z" />
            </svg>
            Exhibition
          </label>
          <div className="space-y-2">
            {exhibitions.map((ex: any) => (
              <div key={ex.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.exhibitionIds.includes(ex.id)}
                  onChange={(e) => handleToggleExhibition(ex.id, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm truncate">{ex.title}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-muted rounded flex items-center gap-2 flex-wrap">
            {filters.exhibitionIds.map((id: string) => {
              const ex = exhibitions.find((e: any) => e.id === id)
              return (
                <span key={id} className="inline-flex items-center gap-1 bg-background px-2 py-1 rounded text-xs">
                  {ex?.title ?? id}
                  <X
                    size={12}
                    className="cursor-pointer hover:text-destructive"
                    onClick={() => handleRemoveExhibition(id)}
                  />
                </span>
              )
            })}
          </div>
        </div>

        {/* Status (вместо Location) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-3 cursor-pointer">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Status
          </label>
          <select
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={filters.status}
            onChange={(e) => setFilters((f: any) => ({ ...f, status: e.target.value }))}
          >
            <option value="__all__">{t('allStatuses')}</option>
            <option value="registered">{t('statusRegistered')}</option>
            <option value="visited">{t('statusVisited')}</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={clearAllFilters}
          >
            Clear ({activeFilterCount})
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={applyFilters}
          >
            Apply Filter
          </Button>
        </div>
      </div>
    </div>
  )
}

export function LeadsSection() {
  const { t } = useLocale()
  const { user } = useAuth()
  const { exhibitions: allExhibitions } = useAdmin()
  const isExhibitor = user?.role === 'exhibitor'
  const exhibitorExhibitionIds = allExhibitions
    .filter((e) => (e.participants ?? []).some((p) => (typeof p === 'object' ? p.id : p) === user?.id))
    .map((e) => e.id)
  const exhibitorExhibitions = allExhibitions.filter((e) => exhibitorExhibitionIds.includes(e.id))

  const [data, setData] = useState<ApiLeadsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(19)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filters, setFilters] = useState({
    name: '',
    exhibitionIds: [] as string[],
    status: '__all__',
  })
  const [appliedFilters, setAppliedFilters] = useState({
    name: '',
    exhibitionIds: [] as string[],
    status: '__all__',
  })

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
        search: appliedFilters.name || undefined,
        exhibitionIds: appliedFilters.exhibitionIds.length ? appliedFilters.exhibitionIds : undefined,
        status: appliedFilters.status === '__all__' ? undefined : appliedFilters.status || undefined,
      })
      setData(res)
    } catch {
      setData({ items: [], total: 0, page: 1, rowsPerPage: 19, totalPages: 0 })
    } finally {
      setLoading(false)
    }
  }, [isExhibitor, exhibitorExhibitionIds.length, page, rowsPerPage, appliedFilters])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const sortedData = useMemo(() => {
    const items = data?.items ?? []
    if (!sortConfig) return items
    return [...items].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof ApiLeadRow] ?? ''
      const bVal = b[sortConfig.key as keyof ApiLeadRow] ?? ''
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' })
      return sortConfig.direction === 'asc' ? cmp : -cmp
    })
  }, [data?.items, sortConfig])

  const handleSort = (key: string) => {
    setSortConfig((current) =>
      current?.key === key && current.direction === 'asc'
        ? { key, direction: 'desc' }
        : { key, direction: 'asc' }
    )
  }

  const handleSelectAll = (checked: boolean) => {
    const items = data?.items ?? []
    setSelectedIds(checked ? items.map((d) => d.id) : [])
  }

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const clearAllFilters = () => {
    setFilters({ name: '', exhibitionIds: [], status: '__all__' })
    setAppliedFilters({ name: '', exhibitionIds: [], status: '__all__' })
    setPage(1)
  }

  const applyFilters = () => {
    setAppliedFilters({ ...filters })
    setPage(1)
  }

  const activeFilterCount = [!!appliedFilters.name, appliedFilters.exhibitionIds.length > 0, appliedFilters.status !== '__all__'].filter(Boolean).length

  const handleDownloadCSV = async () => {
    try {
      const res = await leadsApi.list({
        page: 1,
        rowsPerPage: 10000,
        search: appliedFilters.name || undefined,
        exhibitionIds: appliedFilters.exhibitionIds.length ? appliedFilters.exhibitionIds : undefined,
        status: appliedFilters.status === '__all__' ? undefined : appliedFilters.status || undefined,
      })
      const statusLabels: Record<string, string> = {
        registered: t('statusRegistered'),
        visited: t('statusVisited'),
      }
      const rows = res.items.map((r) => ({
        ...r,
        status: statusLabels[r.status] ?? r.status,
      }))
      const columns = ['name', 'email', 'phone', 'city', 'status', 'exhibitionTitle'] as const
      const headers = [t('nameColumn'), t('email'), t('phoneColumn'), t('city'), t('filterByStatus'), t('exhibitionColumn')]
      const csv = [
        headers.map((h) => `"${h}"`).join(','),
        ...rows.map((row) => columns.map((c) => `"${String(row[c] ?? '').replace(/"/g, '""')}"`).join(',')),
      ].join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      // ignore
    }
  }

  const statusLabel = (s: 'registered' | 'visited') =>
    s === 'visited' ? t('statusVisited') : t('statusRegistered')

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
      {/* Второй хедер на всю ширину, впритык под первым */}
      <div className="w-full border-b border-border bg-card px-6 py-4 flex items-center justify-end gap-3 shrink-0">
        <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="gap-2">
          <Download size={16} />
          Скачать CSV
        </Button>
        <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          Добавить в список
        </Button>
      </div>

      {/* Панель фильтров и таблица одной высоты */}
      <div className="flex flex-1 min-h-0 overflow-hidden p-4 gap-4">
        <div className="h-full min-h-0 w-72 shrink-0 bg-card rounded-lg shadow-sm overflow-hidden flex flex-col">
          <Sidebar
            filters={filters}
            setFilters={setFilters}
            exhibitions={exhibitorExhibitions}
            clearAllFilters={clearAllFilters}
            applyFilters={applyFilters}
            activeFilterCount={activeFilterCount}
            t={t}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-auto bg-card rounded-lg shadow-sm">
          {loading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading...</div>
          ) : (
            <DataTable
              data={sortedData}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onSelectRow={handleSelectRow}
              onSort={handleSort}
              sortConfig={sortConfig}
              statusLabel={statusLabel}
            />
          )}
        </div>
      </div>

      {/* Нижняя панель под таблицей (не внутри) */}
      <div className="w-full shrink-0 bg-muted/40 px-6 py-4 flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {t('rowsPerPage')}: <span className="font-medium">{rowsPerPage}</span>
        </div>
        <div>
          {t('pagesOf')
            .replace('{page}', String(safePage))
            .replace('{total}', String(totalPages))}
        </div>
      </div>
    </div>
  )
}
