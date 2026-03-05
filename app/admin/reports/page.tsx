'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { useLocale } from '@/lib/i18n'
import { useAdmin } from '@/lib/admin-context'
import { registrationsApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, Users, FileText } from 'lucide-react'

const ROLE_LABEL_KEYS: Record<string, string> = {
  visitor: 'visitor',
  exhibitor: 'roleExhibitor',
  participant: 'participant',
  staff: 'roleStaff',
  manager: 'roleManager',
  content_manager: 'contentManager',
  admin: 'admin',
}

function ReportsContent() {
  const { t } = useLocale()
  const { users, exhibitions, news, isLoading: adminLoading } = useAdmin()
  const [allRegistrations, setAllRegistrations] = useState<{ id: string }[]>([])
  const [regsLoading, setRegsLoading] = useState(true)
  useEffect(() => {
    setRegsLoading(true)
    registrationsApi
      .listAll()
      .then(setAllRegistrations)
      .catch(() => setAllRegistrations([]))
      .finally(() => setRegsLoading(false))
  }, [])

  const isLoading = adminLoading || regsLoading

  const totalRegistrations = allRegistrations.length
  const totalExhibitions = exhibitions.length
  const activeExhibitions = exhibitions.filter((e) => e.status === 'published').length
  const totalNews = news.length

  const reportData = [
    { title: t('totalRegistrations'), value: totalRegistrations, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { title: t('exhibitionsCount'), value: totalExhibitions, icon: BarChart3, color: 'bg-green-100 text-green-600' },
    { title: t('publishedExhibitionsCount'), value: activeExhibitions, icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
    { title: t('newsCount'), value: totalNews, icon: FileText, color: 'bg-amber-100 text-amber-600' },
  ]

  const roleCounts = users.reduce(
    (acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  const totalUsers = users.length
  const roleDistribution = Object.entries(roleCounts).map(([role, count]) => ({
    role,
    count,
    percentage: totalUsers ? Math.round((count / totalUsers) * 100) : 0,
  }))

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 pt-14 lg:pt-0 ml-0 lg:ml-64 min-h-screen min-w-0">
        {/* Header */}
        <div className="border-b border-border/40 bg-white/50 backdrop-blur">
          <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <h1 className="text-2xl lg:text-3xl font-bold">{t('reports')}</h1>
            <p className="text-muted-foreground mt-1">{t('reportsSubtitle')}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">{t('loadingDataFromApi')}</div>
          ) : (
            <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {reportData.map((report, idx) => {
              const Icon = report.icon
              return (
                <Card key={idx}>
                  <CardContent className="pt-4 lg:pt-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs lg:text-sm text-muted-foreground truncate">{report.title}</p>
                        <p className="text-xl lg:text-3xl font-bold mt-1 lg:mt-2">{report.value}</p>
                      </div>
                      <div className={`shrink-0 w-10 h-10 lg:w-12 lg:h-12 rounded-lg ${report.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Additional Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('usersByRole')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {roleDistribution.length ? (
                    roleDistribution.map((item) => (
                      <div key={item.role}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{t(ROLE_LABEL_KEYS[item.role] ?? item.role)}</span>
                          <span className="text-sm text-muted-foreground">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('noData')}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('exhibitionStatusChart')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {totalExhibitions > 0 ? (
                    [
                      { status: t('published'), count: activeExhibitions, color: 'bg-green-500' },
                      { status: t('draft'), count: totalExhibitions - activeExhibitions, color: 'bg-yellow-500' },
                    ].map((item) => (
                      <div key={item.status}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{item.status}</span>
                          <span className="text-sm text-muted-foreground">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${item.color} h-2 rounded-full`}
                            style={{ width: `${(item.count / totalExhibitions) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('noExhibitions')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Options */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t('exportData')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button>{t('exportCsv')}</Button>
                <Button variant="outline">{t('exportPdf')}</Button>
                <Button variant="outline">{t('sendByEmail')}</Button>
              </div>
            </CardContent>
          </Card>
            </>
          )}
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
