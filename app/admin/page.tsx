'use client'

import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import Link from 'next/link'

function AdminDashboard() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 pt-14 lg:pt-0 ml-0 lg:ml-64 min-h-screen">
        <div className="border-b border-border/40 bg-white/50 backdrop-blur">
          <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <h1 className="text-2xl lg:text-3xl font-bold">Панель управления</h1>
            <p className="text-muted-foreground mt-1">Добро пожаловать в администраторскую панель Myfair</p>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">Выберите раздел</h2>
              <p className="text-blue-800 mb-4">
                Используйте меню слева для управления пользователями, публикациями и просмотра отчетов
              </p>
              <Link href="/admin/users">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Перейти к модерации пользователей
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'content_manager']}>
      <AdminDashboard />
    </ProtectedRoute>
  )
}
