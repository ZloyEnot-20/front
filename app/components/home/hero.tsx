import Link from 'next/link'

export function Hero() {
  return (
    <section className="border-b border-border/40" style={{ minHeight: '320px' }}>
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            Открывайте миры{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              новых возможностей
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            Найдите и посетите лучшие выставки, встречайте единомышленников и развивайте свой бизнес на ведущих платформах для нетворкинга.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a
              href="#exhibitions"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-11 px-8 hover:bg-primary/90"
            >
              Смотреть выставки
            </a>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background h-11 px-8 hover:bg-accent"
            >
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
