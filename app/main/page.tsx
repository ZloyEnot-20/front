import { Header } from '@/components/layout/header'
import { Hero } from '../components/home/hero'
import { HomeClient } from '../components/home/home-client'

export default function MainHomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <HomeClient />
    </div>
  )
}
