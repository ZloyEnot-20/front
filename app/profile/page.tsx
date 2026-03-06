'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'
import { ExhibitorProfileSection } from '@/components/profile/exhibitor-profile-section'

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ExhibitorProfileSection />
    </ProtectedRoute>
  )
}
