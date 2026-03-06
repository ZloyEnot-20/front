'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useLocale()
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">
          {t('errorSomethingWrong')}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          {t('errorUnexpected')}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button onClick={reset} variant="default">
            {t('tryAgain')}
          </Button>
          <Button asChild variant="outline">
            <Link href="/">{t('toHome')}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
