'use client'

import { useState, useEffect } from 'react'
import { User } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'
import { authApi } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CheckCircle2, Pencil } from 'lucide-react'

const VISITOR_STATUS_KEYS: Record<string, string> = {
  student: 'statusStudent',
  parent: 'statusParent',
  specialist: 'statusSpecialist',
}
const ADMISSION_PLAN_KEYS: Record<string, string> = {
  '0-3': 'admissionPlan03',
  '3-6': 'admissionPlan36',
  '6-12': 'admissionPlan612',
  '12+': 'admissionPlan12plus',
}
const INTEREST_OPTIONS = ['Bachelor', 'Master', 'MBA', 'Short Courses', 'School'] as const
const INTEREST_LABEL_KEYS: Record<(typeof INTEREST_OPTIONS)[number], string> = {
  Bachelor: 'interestBachelor',
  Master: 'interestMaster',
  MBA: 'interestMBA',
  'Short Courses': 'interestShortCourses',
  School: 'interestSchool',
}

interface PersonalInfoSectionProps {
  user: User
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || '—'}</p>
    </div>
  )
}

export function PersonalInfoSection({ user }: PersonalInfoSectionProps) {
  const { t } = useLocale()
  const { refreshUser } = useAuth()
  const visitorStatusLabel = (v: string) => (VISITOR_STATUS_KEYS[v] ? t(VISITOR_STATUS_KEYS[v]) : v) || '—'
  const admissionPlanLabel = (v: string) => (ADMISSION_PLAN_KEYS[v] ? t(ADMISSION_PLAN_KEYS[v]) : v) || '—'
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const nameParts = (user.name || '').trim().split(/\s+/)
  const [formData, setFormData] = useState({
    firstName: user.firstName ?? nameParts[0] ?? '',
    lastName: user.lastName ?? nameParts.slice(1).join(' ') ?? '',
    email: user.email || '',
    phone: user.phone || '',
    country: (user as User & { country?: string }).country || '',
    city: user.city || '',
    visitorStatus: user.visitorStatus || '',
    languageKnowledge: user.languageKnowledge || '',
    interest: user.interest || '',
    countryOfInterest: user.countryOfInterest || '',
    admissionPlan: user.admissionPlan || '',
  })

  useEffect(() => {
    const parts = (user.name || '').trim().split(/\s+/)
    setFormData({
      firstName: user.firstName ?? parts[0] ?? '',
      lastName: user.lastName ?? parts.slice(1).join(' ') ?? '',
      email: user.email || '',
      phone: user.phone || '',
      country: (user as User & { country?: string }).country || '',
      city: user.city || '',
      visitorStatus: user.visitorStatus || '',
      languageKnowledge: user.languageKnowledge || '',
      interest: user.interest || '',
      countryOfInterest: user.countryOfInterest || '',
      admissionPlan: user.admissionPlan || '',
    })
  }, [user])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaveError('')
    setIsSaving(true)
    try {
      await authApi.updateMe({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
        city: formData.city.trim() || undefined,
        visitorStatus: (formData.visitorStatus || undefined) as 'student' | 'parent' | 'specialist' | undefined,
        languageKnowledge: formData.languageKnowledge.trim() || undefined,
        interest: (formData.interest || undefined) as 'Bachelor' | 'Master' | 'MBA' | 'Short Courses' | 'School' | undefined,
        countryOfInterest: formData.countryOfInterest.trim() || undefined,
        admissionPlan: (formData.admissionPlan || undefined) as '0-3' | '3-6' | '6-12' | '12+' | undefined,
      })
      await refreshUser()
      setSaved(true)
      setIsEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : t('saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-lg font-bold text-foreground">{t('personalInfo')}</h3>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              {t('saved')}
            </span>
          )}
          {!isEditing ? (
            <Button
              variant="default"
              size="sm"
              className="rounded-md gap-2"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="w-4 h-4" />
              {t('edit')}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                {t('cancel')}
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FieldRow label={t('firstNameLabel')} value={formData.firstName} />
          <FieldRow label={t('lastNameLabel')} value={formData.lastName} />
          <FieldRow label={t('emailLabel')} value={formData.email} />
          <FieldRow label={t('phoneLabelShort')} value={formData.phone} />
          {user.role === 'visitor' && (
            <>
              <FieldRow label={t('country')} value={formData.country} />
              <FieldRow label={t('cityColumn')} value={formData.city} />
              <FieldRow label={t('status')} value={visitorStatusLabel(formData.visitorStatus)} />
              <FieldRow label={t('languageKnowledge')} value={formData.languageKnowledge} />
              <FieldRow label={t('interestColumn')} value={formData.interest} />
              <FieldRow label={t('countryOfInterestColumn')} value={formData.countryOfInterest} />
              <FieldRow label={t('admissionPlanColumn')} value={admissionPlanLabel(formData.admissionPlan)} />
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">{t('firstNameLabel')}</label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder={t('enterFirstName')}
                className="h-9"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">{t('lastNameLabel')}</label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder={t('enterLastName')}
                className="h-9"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">{t('emailLabel')}</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder={t('enterEmail')}
                className="h-9"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">{t('phoneLabelShort')}</label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder={t('enterPhone')}
                className="h-9"
              />
            </div>
          </div>

          {user.role === 'visitor' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">{t('country')}</label>
                <Input
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder={t('enterCountry')}
                  className="h-9"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">{t('cityColumn')}</label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder={t('enterCity')}
                  className="h-9"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">{t('status')}</label>
                <Select
                  value={formData.visitorStatus || undefined}
                  onValueChange={(v) => handleChange('visitorStatus', v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={t('selectStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(['student', 'parent', 'specialist'] as const).map((val) => (
                      <SelectItem key={val} value={val}>
                        {t(VISITOR_STATUS_KEYS[val])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">{t('languageKnowledge')}</label>
                <Input
                  value={formData.languageKnowledge}
                  onChange={(e) => handleChange('languageKnowledge', e.target.value)}
                  placeholder={t('languagePlaceholder')}
                  className="h-9"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">{t('interestColumn')}</label>
                <Select
                  value={formData.interest || undefined}
                  onValueChange={(v) => handleChange('interest', v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={t('selectInterest')} />
                  </SelectTrigger>
                  <SelectContent>
                    {INTEREST_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {t(INTEREST_LABEL_KEYS[opt])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">{t('countryOfInterestColumn')}</label>
                <Input
                  value={formData.countryOfInterest}
                  onChange={(e) => handleChange('countryOfInterest', e.target.value)}
                  placeholder={t('optional')}
                  className="h-9"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">{t('admissionPlanColumn')}</label>
                <Select
                  value={formData.admissionPlan || undefined}
                  onValueChange={(v) => handleChange('admissionPlan', v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={t('selectPlan')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(['0-3', '3-6', '6-12', '12+'] as const).map((val) => (
                      <SelectItem key={val} value={val}>
                        {t(ADMISSION_PLAN_KEYS[val])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {user.role === 'visitor' && saveError && (
            <p className="text-sm text-destructive">{saveError}</p>
          )}
        </div>
      )}
    </div>
  )
}
