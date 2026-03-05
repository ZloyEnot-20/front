'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { scansApi, auditLogsApi, type ApiScanLogItem, type ApiAuditLogItem } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type LogTypeFilter =
  | 'all'
  | 'LOGIN'
  | 'LOGIN_FAILED'
  | 'CREATE_USER'
  | 'EDIT'
  | 'DELETE'
  | 'PUBLISH'
  | 'SCAN_SUCCESS'
  | 'SCAN_ERROR'

interface UnifiedLog {
  id: string
  type: LogTypeFilter
  timestamp: string
  userEmail: string
  action: string
  status: 'success' | 'error' | 'warning'
}

const PAGE_SIZE = 50

const LOG_TYPE_LABELS: Record<LogTypeFilter, string> = {
  all: 'Все',
  LOGIN: 'Вход',
  LOGIN_FAILED: 'Ошибка входа',
  CREATE_USER: 'Создание пользователя',
  EDIT: 'Редактирование',
  DELETE: 'Удаление',
  PUBLISH: 'Публикация',
  SCAN_SUCCESS: 'Скан (успех)',
  SCAN_ERROR: 'Скан (ошибка)',
}

function LogsContent() {
  const [scanLogs, setScanLogs] = useState<ApiScanLogItem[]>([])
  const [auditLogs, setAuditLogs] = useState<ApiAuditLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<LogTypeFilter>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    Promise.all([scansApi.listAll({ limit: 200 }), auditLogsApi.list({ limit: 200 })])
      .then(([scans, audits]) => {
        setScanLogs(scans)
        setAuditLogs(audits)
      })
      .catch(() => {
        setScanLogs([])
        setAuditLogs([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, filterType])

  useEffect(() => {
    const total = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE))
    setPage((p) => Math.min(p, total))
  }, [filteredLogs.length])

  const unified: UnifiedLog[] = [
    ...scanLogs.map((l) => ({
      id: l.id,
      type: (l.success ? 'SCAN_SUCCESS' : 'SCAN_ERROR') as LogTypeFilter,
      timestamp: l.scannedAt,
      userEmail: l.registration?.email ?? l.scannedByUserId ?? '—',
      action: [l.exhibition?.title, l.errorMessage].filter(Boolean).join(' — ') || (l.success ? 'Вход отмечен' : 'Ошибка скана'),
      status: (l.success ? 'success' : 'error') as 'success' | 'error',
    })),
    ...auditLogs.map((l) => ({
      id: l.id,
      type: l.type as LogTypeFilter,
      timestamp: l.createdAt,
      userEmail: l.userEmail,
      action: l.action,
      status: l.type === 'LOGIN_FAILED' ? ('error' as const) : ('success' as const),
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const filteredLogs = unified.filter((log) => {
    const matchesSearch =
      !searchQuery.trim() ||
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || log.type === filterType
    return matchesSearch && matchesType
  })

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginatedLogs = filteredLogs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const getStatusBadge = (status: UnifiedLog['status']) => {
    if (status === 'success') return <Badge className="bg-green-600">Успех</Badge>
    if (status === 'error') return <Badge className="bg-red-600">Ошибка</Badge>
    return <Badge className="bg-yellow-600">Предупреждение</Badge>
  }

  const logTypes: LogTypeFilter[] = [
    'all',
    'LOGIN',
    'LOGIN_FAILED',
    'CREATE_USER',
    'EDIT',
    'DELETE',
    'PUBLISH',
    'SCAN_SUCCESS',
    'SCAN_ERROR',
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 pt-14 lg:pt-0 ml-0 lg:ml-64 min-h-screen min-w-0">
        <div className="border-b border-border/40 bg-white/50 backdrop-blur">
          <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Логи системы</h1>
            <p className="text-muted-foreground mt-1 text-sm">Аудит и сканы QR с API</p>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <Card className="mb-4 lg:mb-6">
            <CardContent className="pt-4 lg:pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Поиск</label>
                <Input
                  placeholder="По email или действию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Тип</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {logTypes.map((type) => (
                    <Button
                      key={type}
                      variant={filterType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType(type)}
                    >
                      {LOG_TYPE_LABELS[type]}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
              ) : (
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/50">
                      <th className="text-left p-3 lg:p-4 font-medium text-xs lg:text-sm text-muted-foreground">Время</th>
                      <th className="text-left p-3 lg:p-4 font-medium text-xs lg:text-sm text-muted-foreground">Тип</th>
                      <th className="text-left p-3 lg:p-4 font-medium text-xs lg:text-sm text-muted-foreground">Пользователь</th>
                      <th className="text-left p-3 lg:p-4 font-medium text-xs lg:text-sm text-muted-foreground">Действие</th>
                      <th className="text-left p-3 lg:p-4 font-medium text-xs lg:text-sm text-muted-foreground">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.length > 0 ? (
                      paginatedLogs.map((log) => (
                        <tr key={log.id} className="border-b border-border/40 hover:bg-muted/30">
                          <td className="p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('ru-RU')}
                          </td>
                          <td className="p-3 lg:p-4 text-xs lg:text-sm font-medium">{LOG_TYPE_LABELS[log.type]}</td>
                          <td className="p-3 lg:p-4 text-xs lg:text-sm">{log.userEmail}</td>
                          <td className="p-3 lg:p-4 text-xs lg:text-sm">{log.action}</td>
                          <td className="p-3 lg:p-4">{getStatusBadge(log.status)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground text-sm">
                          {unified.length === 0 && !loading ? 'Нет записей' : 'Нет записей по фильтру'}
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
              Показано {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredLogs.length)} из {filteredLogs.length}
              {filteredLogs.length !== unified.length && ` (всего ${unified.length})`}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                >
                  Назад
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
                  Вперёд
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function LogsPage() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <LogsContent />
    </ProtectedRoute>
  )
}
