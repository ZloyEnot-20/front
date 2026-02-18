'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function LogsContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  const mockLogs = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 5 * 60000),
      type: 'LOGIN',
      user: 'admin@example.com',
      action: 'Успешный вход в систему',
      status: 'success',
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 10 * 60000),
      type: 'CREATE_USER',
      user: 'admin@example.com',
      action: 'Создан пользователь ivan@example.com',
      status: 'success',
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 15 * 60000),
      type: 'PUBLISH',
      user: 'manager@example.com',
      action: 'Опубликована выставка "TechExpo 2024"',
      status: 'success',
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 20 * 60000),
      type: 'DELETE',
      user: 'admin@example.com',
      action: 'Удалена новость "Обновление системы"',
      status: 'warning',
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 30 * 60000),
      type: 'LOGIN_FAILED',
      user: 'unknown@example.com',
      action: 'Неудачная попытка входа',
      status: 'error',
    },
    {
      id: 6,
      timestamp: new Date(Date.now() - 45 * 60000),
      type: 'EDIT',
      user: 'manager@example.com',
      action: 'Отредактирована выставка "Design Summit"',
      status: 'success',
    },
  ]

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || log.type === filterType

    return matchesSearch && matchesType
  })

  const getLogTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      LOGIN: 'Вход',
      LOGIN_FAILED: 'Ошибка входа',
      CREATE_USER: 'Создание пользователя',
      DELETE: 'Удаление',
      EDIT: 'Редактирование',
      PUBLISH: 'Публикация',
    }
    return labels[type] || type
  }

  const getStatusBadge = (status: string) => {
    if (status === 'success') return <Badge className="bg-green-600">Успех</Badge>
    if (status === 'error') return <Badge className="bg-red-600">Ошибка</Badge>
    return <Badge className="bg-yellow-600">Предупреждение</Badge>
  }

  const logTypes = ['all', 'LOGIN', 'CREATE_USER', 'EDIT', 'DELETE', 'PUBLISH', 'LOGIN_FAILED']

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <div className="border-b border-border/40 bg-white/50 backdrop-blur">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-bold">Логи системы</h1>
            <p className="text-muted-foreground mt-1">История действий администраторов и пользователей</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Поиск</label>
                <Input
                  placeholder="Поиск по пользователю или действию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Тип действия</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {logTypes.map((type) => (
                    <Button
                      key={type}
                      variant={filterType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType(type)}
                    >
                      {type === 'all' ? 'Все' : getLogTypeLabel(type)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/50">
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Время</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Тип</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Пользователь</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Действие</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="border-b border-border/40 hover:bg-muted/30">
                        <td className="p-4 text-sm text-muted-foreground">
                          {log.timestamp.toLocaleTimeString('ru-RU')}
                        </td>
                        <td className="p-4 text-sm font-medium">{getLogTypeLabel(log.type)}</td>
                        <td className="p-4 text-sm">{log.user}</td>
                        <td className="p-4 text-sm">{log.action}</td>
                        <td className="p-4">{getStatusBadge(log.status)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        Логи не найдены
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-muted-foreground">Показано {filteredLogs.length} из {mockLogs.length}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Назад
              </Button>
              <Button variant="outline" size="sm">
                Далее
              </Button>
            </div>
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
