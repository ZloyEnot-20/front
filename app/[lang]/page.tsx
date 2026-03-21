import '@/app/landing/landing.css'
import LandingHome from '@/app/landing/landing-home'
import { parseLandingLang } from '@/lib/i18n/landing-lang'

export default async function LocalizedLandingPage({
  params,
}: Readonly<{
  params: Promise<{ lang: string }>
}>) {
  const { lang: raw } = await params
  const lang = parseLandingLang(raw)

  return (
    <div className="landing-page">
      <LandingHome initialLang={lang} />
    </div>
  )
}
