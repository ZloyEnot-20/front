'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Users, FileText, BarChart3, LogOut, Menu, X, Home, BookMarked } from 'lucide-react'

export function AdminSidebar() {
  const pathname = usePathname()
  const { t } = useLocale()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const FULL_MENU = [
    { labelKey: 'users' as const, href: '/admin/users', icon: Users, roles: ['admin'] as const },
    { labelKey: 'publications' as const, href: '/admin/publications', icon: FileText, roles: ['admin', 'content_manager'] as const },
    { labelKey: 'reference' as const, href: '/admin/reference', icon: BookMarked, roles: ['admin', 'content_manager'] as const },
    { labelKey: 'reports' as const, href: '/admin/reports', icon: BarChart3, roles: ['admin'] as const },
    { labelKey: 'logs' as const, href: '/admin/logs', icon: LogOut, roles: ['admin'] as const },
  ]
  const menuItems = FULL_MENU.filter((item) => user?.role && item.roles.includes(user.role))

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900 text-white flex items-center justify-between px-4 z-50 border-b border-slate-800">
        <h1 className="text-lg font-bold">{t('appName')}</h1>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-slate-800"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 w-64 bg-slate-900 text-white min-h-screen flex flex-col z-50
          transform transition-transform duration-200 ease-out
          lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 lg:p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{t('appName')}</h1>
            <p className="text-xs text-slate-400 mt-1">{t('adminDashboard')}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-slate-800"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start gap-3 ${isActive ? 'bg-primary' : 'hover:bg-slate-800'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{t(item.labelKey)}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-slate-800 mt-4 pt-4 space-y-2">
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-slate-800"
              >
                <Home className="w-5 h-5" />
                <span>{t('backToSite')}</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 hover:bg-red-900 text-red-400"
              onClick={() => { setMobileOpen(false); logout() }}
            >
              <LogOut className="w-5 h-5" />
              <span>{t('logout')}</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
