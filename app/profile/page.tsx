'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'
import { PersonalInfoSection } from '@/components/profile/personal-info-section'
import { SecuritySection } from '@/components/profile/security-section'
import { ExhibitionsSection } from '@/components/profile/exhibitions-section'
import { ExhibitorProfileSection } from '@/components/profile/exhibitor-profile-section'
import { LeadsSection } from '@/components/profile/leads-section'
import { User, Shield, Briefcase, Building2, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

function ProfileContent() {
  const { user } = useAuth()
  const { t } = useLocale()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const isExhibitor = user?.role === 'exhibitor'

  const PERSONAL_TAB = { id: 'personal' as const, label: t('personalInfo'), icon: User }
  const SECURITY_TAB = { id: 'security' as const, label: t('emailAndPassword'), icon: Shield }
  const EXHIBITIONS_TAB = { id: 'exhibitions' as const, label: t('myExhibitions'), icon: Briefcase }
  const EXHIBITOR_TAB = { id: 'exhibitor' as const, label: t('universityProfile'), icon: Building2 }
  const LEADS_TAB = { id: 'leads' as const, label: t('leadsTab'), icon: Users }

  const tabs = isExhibitor
    ? [LEADS_TAB, EXHIBITIONS_TAB, EXHIBITOR_TAB, SECURITY_TAB]
    : [PERSONAL_TAB, SECURITY_TAB, EXHIBITIONS_TAB]
  const defaultTab = isExhibitor ? 'leads' : 'personal'
  const [activeTab, setActiveTab] = useState(
    tabFromUrl === 'exhibitions' ? 'exhibitions' : tabFromUrl === 'exhibitor' ? 'exhibitor' : tabFromUrl === 'security' ? 'security' : tabFromUrl === 'leads' ? 'leads' : defaultTab,
  )

  useEffect(() => {
    if (tabFromUrl === 'exhibitions') setActiveTab('exhibitions')
    if (tabFromUrl === 'exhibitor') setActiveTab('exhibitor')
    if (tabFromUrl === 'security') setActiveTab('security')
    if (tabFromUrl === 'leads') setActiveTab('leads')
  }, [tabFromUrl])

  useEffect(() => {
    if (isExhibitor && activeTab === 'personal') setActiveTab('leads')
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
      case 'leads':
        return <LeadsSection />
      default:
        return isExhibitor ? <LeadsSection /> : <PersonalInfoSection user={user} />
    }
  }

  const isLeadsTab = activeTab === 'leads'
  return (
    <div className="h-screen flex flex-col bg-muted/30 overflow-hidden">
      <Header
        profileTabs={{
          tabs,
          activeTab,
          setActiveTab,
        }}
      />
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLeadsTab ? (
          <div className="container mx-auto px-4 py-4 h-full min-h-[400px]">
            {renderSection()}
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="rounded-xl border shadow-sm bg-card">
              <CardContent className="p-6">
                {renderSection()}
              </CardContent>
            </Card>
          </div>
        )}
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
