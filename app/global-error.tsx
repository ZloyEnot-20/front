'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="ru">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            backgroundColor: '#f4f4f5',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: 400,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#18181b',
                marginBottom: 8,
              }}
            >
              Что-то пошло не так
            </h1>
            <p
              style={{
                fontSize: 14,
                color: '#71717a',
                lineHeight: 1.5,
                marginBottom: 32,
              }}
            >
              Произошла непредвиденная ошибка. Попробуйте обновить страницу или зайти позже.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => reset()}
                style={{
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#fff',
                  backgroundColor: '#18181b',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                Попробовать снова
              </button>
              <a
                href="/"
                style={{
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#18181b',
                  backgroundColor: 'transparent',
                  border: '1px solid #e4e4e7',
                  borderRadius: 8,
                  textDecoration: 'none',
                }}
              >
                На главную
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
