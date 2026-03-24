import '@/app/landing/landing.css'
import LandingHome from '@/app/landing/landing-home'

export default function RootPage() {
  return (
    <div className="landing-page">
      <LandingHome initialLang="ru" />
    </div>
  )
}
