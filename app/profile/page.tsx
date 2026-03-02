'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/lib/auth-context'
import { PersonalInfoSection } from '@/components/profile/personal-info-section'
import { SecuritySection } from '@/components/profile/security-section'
import { NotificationsSection } from '@/components/profile/notifications-section'
import { ExhibitionsSection } from '@/components/profile/exhibitions-section'
import { ExhibitorProfileSection } from '@/components/profile/exhibitor-profile-section'
import { IntegrationSection } from '@/components/profile/integration-section'
import { User, Shield, Bell, Briefcase, Link as LinkIcon, Building2 } from 'lucide-react'

const BASE_TABS = [
  { id: 'personal' as const, label: 'Личные данные', icon: User },
  { id: 'security' as const, label: 'Почта и пароль', icon: Shield },
  { id: 'exhibitions' as const, label: 'Мои выставки', icon: Briefcase },
]

function ProfileContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const tabs = [
    ...BASE_TABS.slice(0, 2),
    ...(user?.role === 'exhibitor' ? [{ id: 'exhibitor' as const, label: 'Профиль университета', icon: Building2 }] : []),
    ...BASE_TABS.slice(2),
  ]
  const [activeTab, setActiveTab] = useState(tabFromUrl === 'exhibitions' ? 'exhibitions' : tabFromUrl === 'exhibitor' ? 'exhibitor' : 'personal')

  useEffect(() => {
    if (tabFromUrl === 'exhibitions') setActiveTab('exhibitions')
    if (tabFromUrl === 'exhibitor') setActiveTab('exhibitor')
  }, [tabFromUrl])

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>
  }

  const renderSection = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalInfoSection user={user} />
      case 'security':
        return <SecuritySection />
      case 'exhibitor':
        return <ExhibitorProfileSection />
      case 'exhibitions':
        return <ExhibitionsSection />
      default:
        return <PersonalInfoSection user={user} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b-3 border-border/40 bg-background">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold pt-8 pb-4">Профиль</h1>
          <div className="flex justify-center gap-1 overflow-x-auto pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {renderSection()}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}
