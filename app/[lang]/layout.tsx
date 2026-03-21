import { notFound } from 'next/navigation'
import { LocaleFromUrl } from '@/components/locale-from-url'
import { isLandingLang } from '@/lib/i18n/landing-lang'

export default async function LangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: string }>
}>) {
  const { lang } = await params
  if (!isLandingLang(lang)) {
    notFound()
  }

  return (
    <>
      <LocaleFromUrl lang={lang} />
      {children}
    </>
  )
}
