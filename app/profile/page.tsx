'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/lib/auth-context'
import { getImageUrl } from '@/lib/api'
import { PersonalInfoSection } from '@/components/profile/personal-info-section'
import { SecuritySection } from '@/components/profile/security-section'
import { NotificationsSection } from '@/components/profile/notifications-section'
import { ExhibitionsSection } from '@/components/profile/exhibitions-section'
import { ExhibitorProfileSection } from '@/components/profile/exhibitor-profile-section'
import { IntegrationSection } from '@/components/profile/integration-section'
import { User, Shield, Bell, Briefcase, Building2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { UserRole } from '@/lib/types'

const ROLE_LABEL: Record<UserRole, string> = {
  visitor: 'Посетитель',
  exhibitor: 'Университет',
  participant: 'Участник',
  staff: 'Сотрудник',
  manager: 'Менеджер',
  content_manager: 'Менеджер контента',
  admin: 'Администратор',
}

const PERSONAL_TAB = { id: 'personal' as const, label: 'Личные данные', icon: User }
const SECURITY_TAB = { id: 'security' as const, label: 'Почта и пароль', icon: Shield }
const EXHIBITIONS_TAB = { id: 'exhibitions' as const, label: 'Мои выставки', icon: Briefcase }
const EXHIBITOR_TAB = { id: 'exhibitor' as const, label: 'Профиль университета', icon: Building2 }

function ProfileContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const isExhibitor = user?.role === 'exhibitor'
  const tabs = isExhibitor
    ? [EXHIBITOR_TAB, SECURITY_TAB, EXHIBITIONS_TAB]
    : [PERSONAL_TAB, SECURITY_TAB, EXHIBITIONS_TAB]
  const defaultTab = isExhibitor ? 'exhibitor' : 'personal'
  const [activeTab, setActiveTab] = useState(tabFromUrl === 'exhibitions' ? 'exhibitions' : tabFromUrl === 'exhibitor' ? 'exhibitor' : tabFromUrl === 'security' ? 'security' : defaultTab)

  useEffect(() => {
    if (tabFromUrl === 'exhibitions') setActiveTab('exhibitions')
    if (tabFromUrl === 'exhibitor') setActiveTab('exhibitor')
    if (tabFromUrl === 'security') setActiveTab('security')
  }, [tabFromUrl])

  useEffect(() => {
    if (isExhibitor && activeTab === 'personal') setActiveTab('exhibitor')
  }, [isExhibitor, activeTab])

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
        return isExhibitor ? <ExhibitorProfileSection /> : <PersonalInfoSection user={user} />
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header
        profileTabs={{
          tabs,
          activeTab,
          setActiveTab,
        }}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Identity card */}
        <Card className="mb-6 rounded-xl border shadow-sm bg-card overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border">
                  {user.avatar ? (
                    <img src={getImageUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{ROLE_LABEL[user.role]}</p>
                    <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full gap-2 flex-shrink-0"
                    onClick={() => setActiveTab(isExhibitor ? 'exhibitor' : 'personal')}
                  >
                    <Pencil className="w-4 h-4" />
                    Редактировать
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section content in card */}
        <Card className="rounded-xl border shadow-sm bg-card">
          <CardContent className="p-6">
            {renderSection()}
          </CardContent>
        </Card>
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
