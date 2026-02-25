'use client'

import { useState } from 'react'
import { User } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2 } from 'lucide-react'

interface PersonalInfoSectionProps {
  user: User
}

export function PersonalInfoSection({ user }: PersonalInfoSectionProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user.name.split(' ')[0] || '',
    lastName: user.name.split(' ')[1] || '',
    email: user.email || '',
    phone: (user as User & { phone?: string }).phone || '',
    country: 'Россия',
    city: 'Москва',
    zipCode: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex-1 p-8 flex flex-col items-center justify-center ">
      <div className="flex justify-between items-start mb-8">
        {/* <h1 className="text-3xl font-bold">Личные данные</h1> */}
        {isSaving && (
          <div className="flex items-center gap-2 text-primary">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Сохранение...</span>
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm">Изменения сохранены</span>
          </div>
        )}
      </div>

      {/* <div className="border-b border-border pb-8 mb-8">
        <div className="flex justify-center mb-6">
          <div className="relative w-40 h-40">
            
            <button className="absolute bottom-2 right-2 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:bg-primary/90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 2.5h6" />
              </svg>
            </button>
          </div>
        </div>
      </div> */}

      <div className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Имя</label>
            <Input
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="Введите имя"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Фамилия</label>
            <Input
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Введите фамилию"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Введите email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Телефон</label>
            <div className="flex gap-2">
              <select className="px-3 py-2 border border-input rounded-lg bg-background text-sm">
                <option>+7</option>
                <option>+1</option>
                <option>+44</option>
              </select>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Введите номер"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {user.role === 'visitor' && (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Страна</label>
                <select className="w-full px-4 py-2 border border-input rounded-lg bg-background">
                  <option>Россия</option>
                  <option>США</option>
                  <option>Канада</option>
                  <option>Великобритания</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Город</label>
                <select className="w-full px-4 py-2 border border-input rounded-lg bg-background">
                  <option>Москва</option>
                  <option>Санкт-Петербург</option>
                  <option>Новосибирск</option>
                  <option>Екатеринбург</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Почтовый индекс</label>
              <Input
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                placeholder="Введите индекс"
              />
            </div>
          </>
        )}
        <div className="flex justify-center">
        <Button onClick={handleSave} disabled={isSaving} className="mt-8">
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </Button>
        </div>
      </div>
    </div>
  )
}
