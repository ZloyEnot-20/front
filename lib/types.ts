// Роли пользователей
export type UserRole = 'visitor' | 'exhibitor' | 'participant' | 'staff' | 'manager' | 'content_manager' | 'admin'

// Информация об университете-участнике (exhibitor) для отображения на выставке
export interface ExhibitorInfo {
  id: string
  name: string
  avatar?: string
  exhibitorDescription?: string
  exhibitorAddress?: string
  exhibitorWebsite?: string
  exhibitorPhotos?: string[]
}

// Пользователь
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  status?: 'active' | 'blocked' | 'pending'
  avatar?: string
  phone?: string
  exhibitorDescription?: string
  exhibitorAddress?: string
  exhibitorWebsite?: string
  exhibitorPhotos?: string[]
  createdAt: Date
  updatedAt: Date
}

// Статус выставки
export type ExhibitionStatus = 'draft' | 'published' | 'archived' | 'cancelled'

// Город (справочник)
export interface City {
  id: string
  name: string
  createdAt?: Date
  updatedAt?: Date
}

// Выставка
export interface Exhibition {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  /** Города из справочника (множественный выбор) */
  cities?: { id: string; name: string }[]
  /** Университеты-участники (exhibitor) */
  participants?: ExhibitorInfo[]
  image?: string
  /** Баннер: карточка и шапка страницы */
  banner?: string
  /** До 10 изображений на странице публикации */
  images?: string[]
  status: ExhibitionStatus
  participantCount: number
  registrations: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// Новость
export interface News {
  id: string
  title: string
  content: string
  excerpt: string
  image?: string
  /** Баннер: карточка и шапка страницы */
  banner?: string
  /** До 10 изображений на странице публикации */
  images?: string[]
  publishedAt: Date
  createdBy: string
  status: 'draft' | 'published'
  createdAt: Date
  updatedAt: Date
}

// Участник выставки
export interface ExhibitionParticipant {
  id: string
  exhibitionId: string
  userId: string
  companyName: string
  boothNumber?: string
  status: 'registered' | 'confirmed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

// Сессия пользователя
export interface UserSession {
  userId: string
  user: User
  expiresAt: Date
}

// Регистрация visitor на выставку
export interface ExhibitionRegistration {
  id: string
  exhibitionId: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  qrCode: string // QR код в виде URL или data:image
  status: 'registered' | 'cancelled'
  registeredAt: Date
  cancelledAt?: Date
}
