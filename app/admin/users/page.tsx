'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { CreateUserModal } from '@/components/admin/create-user-modal'
import { useAdmin } from '@/lib/admin-context'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Users, Activity, Plus, Loader2, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { User } from '@/lib/types'

const ROLE_LABELS: Record<string, string> = {
  visitor: 'Посетитель',
  exhibitor: 'Экспонент',
  participant: 'Участник',
  staff: 'Сотрудник',
  manager: 'Менеджер',
  content_manager: 'Менеджер контента',
  admin: 'Администратор',
}

function UsersModeration() {
  const { user: currentUser } = useAuth()
  const { users, updateUser, isLoading, refresh } = useAdmin()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    refresh()
  }, [refresh])
  const [createUserOpen, setCreateUserOpen] = useState(false)
  const [viewUser, setViewUser] = useState<User | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', status: '', phone: '' })
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || u.role === filterRole
    return matchesSearch && matchesRole
  })

  const roleFilters = [
    { value: 'all', label: 'Все' },
    ...Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
  ]

  const stats = {
    totalUsers: users.length,
    activeSessions: Math.floor(users.length * 0.7),
    newToday: Math.floor(Math.random() * 30) + 10,
    awaitingModeration: users.filter((u) => u.status === 'blocked').length,
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      visitor: 'Visitor',
      exhibitor: 'Exhibitor',
      staff: 'Staff',
      manager: 'Content Manager',
      admin: 'Admin',
    }
    return labels[role] || role
  }

  const getStatusBadge = (status: string) => {
    if (status === 'active')
      return <Badge className="bg-green-600">Активен</Badge>
    if (status === 'pending')
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Ожидает</Badge>
    return <Badge variant="secondary">Неактивен</Badge>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 pt-14 lg:pt-0 ml-0 lg:ml-64 min-h-screen min-w-0">
        {/* Header */}
        <div className="border-b border-border/40 bg-white/50 backdrop-blur">
          <div className="px-4 sm:px-6 lg:px-8 py-3 lg:py-4 max-w-7xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold">Модерация пользователей</h1>
            <p className="text-muted-foreground mt-1">Управление пользователями системы</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6 flex items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Всего пользователей</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    <p className="text-xs text-green-600 mt-1">+12% vs прошлый месяц</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Активных сессий</p>
                    <p className="text-2xl font-bold">Скоро</p>
                    <p className="text-xs text-green-600 mt-1">+5% vs прошлый месяц</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Новых сегодня</p>
                    <p className="text-2xl font-bold">Скоро</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ожидают модерации</p>
                    <p className="text-2xl font-bold">Скоро</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Поиск по имени или email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={() => setCreateUserOpen(true)} className="gap-2 w-full sm:w-auto shrink-0">
                <Plus className="w-4 h-4" />
                Создать пользователя
              </Button>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Роль</label>
              <div className="flex flex-wrap gap-2">
                {roleFilters.map((r) => (
                  <Button
                    key={r.value}
                    variant={filterRole === r.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterRole(r.value)}
                  >
                    {r.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Users Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/50">
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Имя</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Email</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Роль</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Статус</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Дата регистрации</th>
                    <th className="text-center p-4 font-medium text-sm text-muted-foreground">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/40">
                        <td className="p-4"><Skeleton className="h-5 w-24" /></td>
                        <td className="p-4"><Skeleton className="h-5 w-36" /></td>
                        <td className="p-4"><Skeleton className="h-5 w-20" /></td>
                        <td className="p-4"><Skeleton className="h-6 w-16" /></td>
                        <td className="p-4"><Skeleton className="h-5 w-24" /></td>
                        <td className="p-4 text-center"><Skeleton className="h-8 w-8 mx-auto rounded" /></td>
                      </tr>
                    ))
                  ) : (
                    filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border/40 hover:bg-muted/30">
                      <td className="p-4 font-medium">{user.name}</td>
                      <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="p-4 text-sm capitalize">{getRoleLabel(user.role ?? '')}</td>
                      <td className="p-4">{getStatusBadge(user.status ?? 'active')}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {user.createdAt instanceof Date ? user.createdAt.toLocaleDateString('ru-RU') : new Date(user.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="p-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewUser(user)}>
                              Просмотр профиля
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setEditUser(user)
                              setEditForm({
                                name: user.name,
                                email: user.email,
                                role: user.role ?? '',
                                status: user.status ?? 'active',
                                phone: user.phone ?? '',
                              })
                              setEditError('')
                            }}>
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Отправить письмо
                            </DropdownMenuItem>
                            {currentUser?.id !== user.id && (
                              <DropdownMenuItem
                                onClick={() => updateUser(user.id, { status: user.status === 'active' ? 'blocked' : 'active' })}
                                className={user.status === 'blocked' ? 'text-green-600' : 'text-destructive'}
                              >
                                {user.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <CreateUserModal isOpen={createUserOpen} onOpenChange={setCreateUserOpen} />

        {/* View profile modal */}
        <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Профиль пользователя</DialogTitle>
            </DialogHeader>
            {viewUser && (
              <div className="space-y-4 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Имя</p>
                  <p className="font-medium">{viewUser.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{viewUser.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Роль</p>
                  <p className="font-medium">{ROLE_LABELS[viewUser.role] ?? viewUser.role}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Статус</p>
                  <p className="font-medium">{getStatusBadge(viewUser.status ?? 'active')}</p>
                </div>
                {viewUser.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Телефон</p>
                    <p className="font-medium">{viewUser.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Зарегистрирован</p>
                  <p className="font-medium text-sm">{viewUser.createdAt instanceof Date ? viewUser.createdAt.toLocaleDateString('ru-RU') : new Date(viewUser.createdAt).toLocaleDateString('ru-RU')}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit user modal */}
        <Dialog open={!!editUser} onOpenChange={(open) => {
          if (!open) {
            setEditUser(null)
            setEditError('')
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Редактировать пользователя</DialogTitle>
            </DialogHeader>
            {editUser && (
              <form
                className="space-y-4 pt-2"
                onSubmit={async (e) => {
                  e.preventDefault()
                  setEditError('')
                  if (!editForm.name.trim()) {
                    setEditError('Введите имя')
                    return
                  }
                  if (!editForm.email.trim() || !editForm.email.includes('@')) {
                    setEditError('Введите корректный email')
                    return
                  }
                  setEditSaving(true)
                  try {
                    await updateUser(editUser.id, {
                      name: editForm.name.trim(),
                      email: editForm.email.trim(),
                      role: editForm.role as User['role'],
                      status: (editForm.status || 'active') as User['status'],
                      phone: editForm.phone.trim() || undefined,
                    })
                    setEditUser(null)
                  } catch (err) {
                    setEditError(err instanceof Error ? err.message : 'Ошибка сохранения')
                  } finally {
                    setEditSaving(false)
                  }
                }}
              >
                <div>
                  <label className="text-sm font-medium">Имя</label>
                  <Input
                    className="mt-1"
                    value={editForm.name}
                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Имя"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    className="mt-1"
                    value={editForm.email}
                    onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Роль</label>
                  <Select value={editForm.role} onValueChange={(v) => setEditForm((p) => ({ ...p, role: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Статус</label>
                  <Select value={editForm.status} onValueChange={(v) => setEditForm((p) => ({ ...p, status: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Активен</SelectItem>
                      <SelectItem value="blocked">Заблокирован</SelectItem>
                      <SelectItem value="pending">Ожидает</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Телефон</label>
                  <Input
                    className="mt-1"
                    value={editForm.phone}
                    onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+7 ..."
                  />
                </div>
                {editError && <p className="text-sm text-destructive">{editError}</p>}
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
                    Отмена
                  </Button>
                  <Button type="submit" disabled={editSaving}>
                    {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Сохранить'}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <UsersModeration />
    </ProtectedRoute>
  )
}
