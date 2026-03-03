'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { authApi } from '@/lib/api'
import { useLocale } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Loader2 } from 'lucide-react'

const LANG = ['uz', 'ru', 'en'] as const
type Lang = (typeof LANG)[number]

const t: Record<Lang, Record<string, string>> = {
  uz: {
    title: "Ro'yxatdan o'tish",
    subtitle: "Visitor sifatida hisob yarating",
    langStep: "Tilni tanlang",
    firstName: 'Ism',
    lastName: 'Familiya',
    phone: 'Telefon',
    email: 'Email',
    sendCode: "Kod yuborish",
    sendingCode: 'Yuborilmoqda',
    codeSent: "Kod yuborildi",
    codeSentWait: 'Yuborildi',
    codePlaceholder: 'Kod',
    city: 'Shahar',
    status: 'Status',
    statusStudent: 'Talaba',
    statusParent: 'Ota-ona',
    statusSpecialist: 'Mutaxassis',
    languageKnowledge: 'Til bilimi (masalan: Ingliz tili B2)',
    languageHint: 'Daraja: A1–C2',
    interest: 'Qiziqish',
    interestBachelor: 'Bachelor',
    interestMaster: 'Master',
    interestMBA: 'MBA',
    interestShortCourses: 'Short Courses',
    interestSchool: 'School',
    countryOfInterest: 'Qiziqayotgan mamlakat (ixtiyoriy)',
    admissionPlan: 'Qabul rejasi (ixtiyoriy)',
    plan03: '0–3 oy',
    plan36: '3–6 oy',
    plan612: '6–12 oy',
    plan12: '12+ oy',
    consent: "Shaxsiy ma'lumotlarni qayta ishlashga roziman",
    password: 'Parol',
    confirmPassword: 'Parolni tasdiqlang',
    submit: "Ro'yxatdan o'tish",
    haveAccount: 'Hisobingiz bormi?',
    login: 'Kirish',
    errRequired: "To'ldiring",
    errEmailCode: 'Emailni tasdiqlang: kodni kiriting',
    errConsent: 'Rozilikni belgilang',
    errPasswordMatch: 'Parollar mos kelmadi',
  },
  ru: {
    title: 'Регистрация',
    subtitle: 'Создайте учётную запись как посетитель',
    langStep: 'Выберите язык',
    firstName: 'Имя',
    lastName: 'Фамилия',
    phone: 'Телефон',
    email: 'Email',
    sendCode: 'Отправить код',
    sendingCode: 'Отправка',
    codeSent: 'Код отправлен',
    codeSentWait: 'Отправлено',
    codePlaceholder: 'Код из письма',
    city: 'Город',
    status: 'Статус',
    statusStudent: 'Студент',
    statusParent: 'Родитель',
    statusSpecialist: 'Специалист',
    languageKnowledge: 'Знание языков (например: Английский B2)',
    languageHint: 'Уровень: A1–C2',
    interest: 'Интерес',
    interestBachelor: 'Bachelor',
    interestMaster: 'Master',
    interestMBA: 'MBA',
    interestShortCourses: 'Short Courses',
    interestSchool: 'School',
    countryOfInterest: 'Страна интереса (необязательно)',
    admissionPlan: 'План поступления (необязательно)',
    plan03: '0–3 мес.',
    plan36: '3–6 мес.',
    plan612: '6–12 мес.',
    plan12: '12+ мес.',
    consent: 'Даю согласие на обработку персональных данных',
    password: 'Пароль',
    confirmPassword: 'Подтверждение пароля',
    submit: 'Зарегистрироваться',
    haveAccount: 'Уже есть учётная запись?',
    login: 'Войти',
    errRequired: 'Обязательное поле',
    errEmailCode: 'Подтвердите email: введите код из письма',
    errConsent: 'Необходимо согласие на обработку данных',
    errPasswordMatch: 'Пароли не совпадают',
  },
  en: {
    title: 'Registration',
    subtitle: 'Create an account as Visitor',
    langStep: 'Choose language',
    firstName: 'First name',
    lastName: 'Last name',
    phone: 'Phone',
    email: 'Email',
    sendCode: 'Send code',
    sendingCode: 'Sending',
    codeSent: 'Code sent',
    codeSentWait: 'Sent',
    codePlaceholder: 'Code from email',
    city: 'City',
    status: 'Status',
    statusStudent: 'Student',
    statusParent: 'Parent',
    statusSpecialist: 'Specialist',
    languageKnowledge: 'Language knowledge (e.g. English B2)',
    languageHint: 'Level: A1–C2',
    interest: 'Interest',
    interestBachelor: 'Bachelor',
    interestMaster: 'Master',
    interestMBA: 'MBA',
    interestShortCourses: 'Short Courses',
    interestSchool: 'School',
    countryOfInterest: 'Country of interest (optional)',
    admissionPlan: 'Admission plan (optional)',
    plan03: '0–3 months',
    plan36: '3–6 months',
    plan612: '6–12 months',
    plan12: '12+ months',
    consent: 'I agree to the processing of personal data',
    password: 'Password',
    confirmPassword: 'Confirm password',
    submit: 'Register',
    haveAccount: 'Already have an account?',
    login: 'Log in',
    errRequired: 'Required',
    errEmailCode: 'Verify email: enter the code from the email',
    errConsent: 'You must agree to data processing',
    errPasswordMatch: 'Passwords do not match',
  },
}

const INTEREST_OPTIONS = ['Bachelor', 'Master', 'MBA', 'Short Courses', 'School'] as const
const ADMISSION_PLANS = ['0-3', '3-6', '6-12', '12+'] as const

export function VisitorSignupForm() {
  const router = useRouter()
  const { signup, isLoading } = useAuth()
  const globalLocale = useLocale()
  const [step, setStep] = useState<'language' | 'form'>('language')
  const [lang, setLangState] = useState<Lang>(() => globalLocale.lang)
  const setLang = (l: Lang) => {
    setLangState(l)
    globalLocale.setLang(l)
  }
  const [error, setError] = useState('')
  const [emailCodeSent, setEmailCodeSent] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const COOLDOWN_SEC = 60
  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown((c) => (c <= 1 ? 0 : c - 1)), 1000)
    return () => clearInterval(t)
  }, [countdown])

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    emailCode: '',
    city: '',
    visitorStatus: '' as '' | 'student' | 'parent' | 'specialist',
    languageKnowledge: '',
    interest: '' as '' | 'Bachelor' | 'Master' | 'MBA' | 'Short Courses' | 'School',
    countryOfInterest: '',
    admissionPlan: '' as '' | '0-3' | '3-6' | '6-12' | '12+',
    consentGiven: false,
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (step === 'language') setLangState(globalLocale.lang)
  }, [globalLocale.lang, step])

  const T = t[lang]

  const handleSendCode = async () => {
    const email = formData.email.trim()
    if (!email) {
      setError(T.errRequired)
      return
    }
    setError('')
    setSendingCode(true)
    try {
      await authApi.sendEmailCode(email)
      setEmailCodeSent(true)
      setCountdown(COOLDOWN_SEC)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки кода')
    } finally {
      setSendingCode(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError(T.errPasswordMatch)
      return
    }
    if (!formData.consentGiven) {
      setError(T.errConsent)
      return
    }
    if (!formData.emailCode.trim()) {
      setError(T.errEmailCode)
      return
    }

    try {
      await signup({
        email: formData.email.trim(),
        password: formData.password,
        role: 'visitor',
        emailCode: formData.emailCode.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        visitorStatus: formData.visitorStatus as 'student' | 'parent' | 'specialist',
        languageKnowledge: formData.languageKnowledge.trim(),
        interest: formData.interest as 'Bachelor' | 'Master' | 'MBA' | 'Short Courses' | 'School',
        countryOfInterest: formData.countryOfInterest.trim() || undefined,
        admissionPlan: formData.admissionPlan || undefined,
        consentGiven: true,
      })
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации')
    }
  }

  if (step === 'language') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{T.title}</CardTitle>
          <CardDescription>{T.langStep}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 justify-center flex-wrap">
            {LANG.map((l) => (
              <Button
                key={l}
                type="button"
                variant={lang === l ? 'default' : 'outline'}
                onClick={() => setLang(l)}
              >
                {l.toUpperCase()}
              </Button>
            ))}
          </div>
          <Button className="w-full" onClick={() => setStep('form')}>
            {T.submit}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>{T.title}</CardTitle>
        <CardDescription>{T.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{T.firstName} *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder={T.firstName}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{T.lastName} *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder={T.lastName}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{T.phone} *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+998 90 123 45 67"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{T.email} *</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@mail.com"
                required
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSendCode}
                disabled={sendingCode || isLoading || countdown > 0}
              >
                {sendingCode ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {T.sendingCode}
                  </>
                ) : countdown > 0 ? (
                  `${T.codeSentWait} (0:${String(countdown).padStart(2, '0')})`
                ) : (
                  T.sendCode
                )}
              </Button>
            </div>
            {emailCodeSent && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{T.codeSent}</p>
                <InputOTP
                  maxLength={6}
                  value={formData.emailCode}
                  onChange={(v) => setFormData({ ...formData, emailCode: v })}
                >
                  <InputOTPGroup className="gap-1">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">{T.city} *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder={T.city}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>{T.status} *</Label>
            <Select
              value={formData.visitorStatus}
              onValueChange={(v) => setFormData({ ...formData, visitorStatus: v as typeof formData.visitorStatus })}
              required
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={T.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">{T.statusStudent}</SelectItem>
                <SelectItem value="parent">{T.statusParent}</SelectItem>
                <SelectItem value="specialist">{T.statusSpecialist}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="languageKnowledge">{T.languageKnowledge} *</Label>
            <Input
              id="languageKnowledge"
              value={formData.languageKnowledge}
              onChange={(e) => setFormData({ ...formData, languageKnowledge: e.target.value })}
              placeholder="English B2, Русский C1"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">{T.languageHint}</p>
          </div>

          <div className="space-y-2">
            <Label>{T.interest} *</Label>
            <Select
              value={formData.interest}
              onValueChange={(v) => setFormData({ ...formData, interest: v as typeof formData.interest })}
              required
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={T.interest} />
              </SelectTrigger>
              <SelectContent>
                {INTEREST_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {T[`interest${opt === 'Short Courses' ? 'ShortCourses' : opt}` as keyof typeof T] ?? opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="countryOfInterest">{T.countryOfInterest}</Label>
            <Input
              id="countryOfInterest"
              value={formData.countryOfInterest}
              onChange={(e) => setFormData({ ...formData, countryOfInterest: e.target.value })}
              placeholder=""
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>{T.admissionPlan}</Label>
            <Select
              value={formData.admissionPlan}
              onValueChange={(v) => setFormData({ ...formData, admissionPlan: v as typeof formData.admissionPlan })}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={T.admissionPlan} />
              </SelectTrigger>
              <SelectContent>
                {ADMISSION_PLANS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {(T as Record<string, string>)[`plan${p.replace('-', '')}`] ?? p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{T.password} *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{T.confirmPassword} *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="consent"
              checked={formData.consentGiven}
              onCheckedChange={(v) => setFormData({ ...formData, consentGiven: v === true })}
              disabled={isLoading}
            />
            <label htmlFor="consent" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {T.consent} *
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '...' : T.submit}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {T.haveAccount}{' '}
          <a href="/auth/login" className="text-primary hover:underline">
            {T.login}
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
