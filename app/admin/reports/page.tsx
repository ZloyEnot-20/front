'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { useAdmin } from '@/lib/admin-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, Users } from 'lucide-react'

function ReportsContent() {
  const { users, exhibitions } = useAdmin()
  const totalRegistrations = users.length
  const totalExhibitions = exhibitions.length
  const activeExhibitions = exhibitions.filter((e) => e.status === 'published').length

  const reportData = [
    {
      title: 'Всего регистраций',
      value: totalRegistrations,
      change: '+12% vs прошлый месяц',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Выставок создано',
      value: totalExhibitions,
      change: '+5% vs прошлый месяц',
      icon: BarChart3,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Активных выставок',
      value: activeExhibitions,
      change: '+8% vs прошлый месяц',
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 pt-14 lg:pt-0 ml-0 lg:ml-64 min-h-screen">
        {/* Header */}
        <div className="border-b border-border/40 bg-white/50 backdrop-blur">
          <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <h1 className="text-2xl lg:text-3xl font-bold">Отчеты</h1>
            <p className="text-muted-foreground mt-1">Аналитика и статистика платформы</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {reportData.map((report, idx) => {
              const Icon = report.icon
              return (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{report.title}</p>
                        <p className="text-3xl font-bold mt-2">{report.value}</p>
                        <p className="text-xs text-green-600 mt-2">{report.change}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg ${report.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Additional Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Распределение пользователей по ролям</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { role: 'Visitor', count: 1000, percentage: 70 },
                    { role: 'Exhibitor', count: 200, percentage: 15 },
                    { role: 'Staff', count: 100, percentage: 8 },
                    { role: 'Manager', count: 50, percentage: 5 },
                    { role: 'Admin', count: 10, percentage: 2 },
                  ].map((item) => (
                    <div key={item.role}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.role}</span>
                        <span className="text-sm text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Статус выставок</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { status: 'Опубликовано', count: activeExhibitions, color: 'bg-green-500' },
                    { status: 'Черновик', count: totalExhibitions - activeExhibitions, color: 'bg-yellow-500' },
                  ].map((item) => (
                    <div key={item.status}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.status}</span>
                        <span className="text-sm text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${item.color} h-2 rounded-full`}
                          style={{
                            width: `${(item.count / totalExhibitions) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Options */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Экспорт данных</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button>Экспортировать в CSV</Button>
                <Button variant="outline">Экспортировать в PDF</Button>
                <Button variant="outline">Отправить на email</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function ReportsPage() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <ReportsContent />
    </ProtectedRoute>
  )
}
