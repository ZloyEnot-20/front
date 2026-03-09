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
  firstName?: string
  lastName?: string
  city?: string
  visitorStatus?: string
  languageKnowledge?: string
  interest?: string
  countryOfInterest?: string
  admissionPlan?: string
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

// Выставка (title/description — fallback; по языку: titleUz/Ru/En, descriptionUz/Ru/En)
export interface Exhibition {
  id: string
  title: string
  description: string
  titleUz?: string
  titleRu?: string
  titleEn?: string
  descriptionUz?: string
  descriptionRu?: string
  descriptionEn?: string
  /** Место проведения (fallback) */
  venue?: string
  venueUz?: string
  venueRu?: string
  venueEn?: string
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

// Новость (title/content/excerpt — fallback; по языку: titleUz/Ru/En, contentUz/Ru/En, excerptUz/Ru/En)
export interface News {
  id: string
  title: string
  content: string
  excerpt: string
  titleUz?: string
  titleRu?: string
  titleEn?: string
  contentUz?: string
  contentRu?: string
  contentEn?: string
  excerptUz?: string
  excerptRu?: string
  excerptEn?: string
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
