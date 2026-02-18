'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Users, FileText, BarChart3, LogOut, Settings } from 'lucide-react'

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  const menuItems = [
    {
      label: 'Пользователи',
      href: '/admin/users',
      icon: Users,
    },
    {
      label: 'Публикации',
      href: '/admin/publications',
      icon: FileText,
    },
    {
      label: 'Отчеты',
      href: '/admin/reports',
      icon: BarChart3,
    },
    {
      label: 'Логи',
      href: '/admin/logs',
      icon: LogOut,
    },
  ]

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold">Myfair</h1>
        <p className="text-xs text-slate-400 mt-1">Панель управления</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={`w-full justify-start gap-3 ${isActive ? 'bg-primary' : 'hover:bg-slate-800'}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-slate-800 space-y-3">
       
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 hover:bg-red-900 text-red-400"
          onClick={logout}
        >
          <LogOut className="w-5 h-5" />
          <span>Выход</span>
        </Button>
      </div>
    </aside>
  )
}
