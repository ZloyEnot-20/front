// Роли пользователей
export type UserRole = 'visitor' | 'exhibitor' | 'participant' | 'staff' | 'manager' | 'content_manager' | 'admin'

// Пользователь
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  status?: 'active' | 'blocked' | 'pending'
  avatar?: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}

// Статус выставки
export type ExhibitionStatus = 'draft' | 'published' | 'archived' | 'cancelled'

// Выставка
export interface Exhibition {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  cities?: string[]
  image?: string
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
