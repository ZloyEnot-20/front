'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className="hidden sm:inline font-bold text-lg">Myfair</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Выставки
          </Link>
          <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Новости
          </Link>
          {user && (
            <>
              {(user.role === 'admin' || user.role === 'content_manager') && (
                <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Управление
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground capitalize">
                  {user.role === 'content_manager'
                    ? 'Менеджер контента'
                    : user.role === 'participant'
                      ? 'Участник'
                      : user.role === 'admin'
                        ? 'Администратор'
                        : 'Посетитель'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Профиль</Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Админ панель</Link>
                  </DropdownMenuItem>
                )}
                {user.role === 'content_manager' && (
                  <DropdownMenuItem asChild>
                    <Link href="/manager">Управление контентом</Link>
                  </DropdownMenuItem>
                )}
                {user.role === 'participant' && (
                  <DropdownMenuItem asChild>
                    <Link href="/participant">Мой кабинет</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  Выход
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Вход</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Регистрация</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
