'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { CreateUserModal } from '@/components/admin/create-user-modal'
import { useAdmin } from '@/lib/admin-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Users, Activity, TrendingUp, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function UsersModeration() {
  const { users, updateUser, deleteUser } = useAdmin()
  const [searchQuery, setSearchQuery] = useState('')
  const [createUserOpen, setCreateUserOpen] = useState(false)

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

      <main className="flex-1 ml-64">
        {/* Header */}
        <div className="border-b border-border/40 bg-white/50 backdrop-blur">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-bold">Модерация пользователей</h1>
            <p className="text-muted-foreground mt-1">Управление пользователями системы</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
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
              <CardContent className="pt-6">
                <div className="flex justify-center items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Активных сессий</p>
                    <p className="text-2xl font-bold">{stats.activeSessions}</p>
                    <p className="text-xs text-green-600 mt-1">+5% vs прошлый месяц</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Новых сегодня</p>
                    <p className="text-2xl font-bold">{stats.newToday}</p>
                    <p className="text-xs text-green-600 mt-1">+8% vs прошлый месяц</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ожидают модерации</p>
                    <p className="text-2xl font-bold">{stats.awaitingModeration}</p>
                    <p className="text-xs text-red-600 mt-1">-2% vs прошлый месяц</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6 flex gap-4">
            <Input
              placeholder="Поиск по имени или email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={() => setCreateUserOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Создать пользователя
            </Button>
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
                    <th className="text-center p-4 font-medium text-sm text-muted-foreground">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border/40 hover:bg-muted/30">
                      <td className="p-4 font-medium">{user.name}</td>
                      <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="p-4 text-sm capitalize">{getRoleLabel(user.role)}</td>
                      <td className="p-4">{getStatusBadge(user.status)}</td>
                      <td className="p-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              Просмотр профиля
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Отправить письмо
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateUser(user.id, { status: user.status === 'active' ? 'blocked' : 'active' })}
                              className={user.status === 'blocked' ? 'text-green-600' : 'text-destructive'}
                            >
                              {user.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteUser(user.id)}>
                              Удалить пользователя
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <CreateUserModal isOpen={createUserOpen} onOpenChange={setCreateUserOpen} />
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
