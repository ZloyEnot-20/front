'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'
import { UserRole } from '@/lib/types'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: UserRole[]
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const { t } = useLocale()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (requiredRoles && !requiredRoles.includes(user.role)) {
      router.push('/')
    }
  }, [user, isLoading, requiredRoles, router])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">{t('loading')}</div>
  }

  if (!user) {
    return null
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
