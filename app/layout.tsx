import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { AdminProvider } from '@/lib/admin-context'
import { LocaleProvider } from '@/lib/i18n'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-geist-sans',
})
const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'EDU Expo - Организация выставок',
  description: 'Платформа для организации выставок, билетами и участниками',
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png', sizes: '32x32' }],
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <LocaleProvider>
          <AuthProvider>
            <AdminProvider>
              {children}
            </AdminProvider>
          </AuthProvider>
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  )
}
