'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'

function AdminRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin/users')
  }, [router])
  return null
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'content_manager']}>
      <AdminRedirect />
    </ProtectedRoute>
  )
}
