'use client'

import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'
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
  const { t, lang, setLang } = useLocale()
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
          <span className="hidden sm:inline font-bold text-lg">{t('appName')}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            {t('exhibitions')}
          </Link>
          <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            {t('news')}
          </Link>
          {user && (
            <>
              {user.role === 'admin' && (
                <Link href="/admin" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  {t('management')}
                </Link>
              )}
              {user.role === 'content_manager' && (
                <Link href="/admin/publications" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  {t('myContent')}
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-3 border-l border-border/60 pl-4">
          <div className="flex gap-1 text-xs text-muted-foreground">
            {(['uz', 'ru', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-1.5 py-0.5 rounded ${lang === l ? 'bg-primary/20 text-primary font-medium' : 'hover:text-foreground'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
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
                    ? t('contentManager')
                    : user.role === 'participant'
                      ? t('participant')
                      : user.role === 'admin'
                        ? t('admin')
                        : t('visitor')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">{t('profile')}</Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">{t('adminPanel')}</Link>
                  </DropdownMenuItem>
                )}
                {user.role === 'content_manager' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/publications">{t('myContent')}</Link>
                  </DropdownMenuItem>
                )}
                {user.role === 'participant' && (
                  <DropdownMenuItem asChild>
                    <Link href="/participant">{t('myCabinet')}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">{t('login')}</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">{t('signup')}</Link>
              </Button>
            </>
          )}
          </div>
        </div>
      </div>
    </header>
  )
}
