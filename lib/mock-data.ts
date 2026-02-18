import { User, Exhibition, News, ExhibitionParticipant } from './types'

// Mock пользователи
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'visitor@example.com',
    name: 'Иван Посетитель',
    role: 'visitor',
    avatar: '/placeholder-user.jpg',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    email: 'participant@example.com',
    name: 'Александр Участник',
    role: 'participant',
    avatar: '/placeholder-user.jpg',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    email: 'manager@example.com',
    name: 'Мария Менеджер',
    role: 'content_manager',
    avatar: '/placeholder-user.jpg',
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '4',
    email: 'admin@example.com',
    name: 'Администратор',
    role: 'admin',
    avatar: '/placeholder-user.jpg',
    createdAt: new Date('2023-11-01'),
    updatedAt: new Date('2024-01-15'),
  },
]

// Mock выставки
export const mockExhibitions: Exhibition[] = [
  {
    id: 'exp-1',
    title: 'TechExpo 2024',
    description:
      'Международная выставка инновационных технологий. Встретьтесь с ведущими компаниями и узнайте о последних тенденциях в IT индустрии.',
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-03-18'),
    location: 'Москва, МВЦ "Экспо"',
    image: '/exhibitions/techexpo.jpg',
    status: 'published',
    participantCount: 150,
    registrations: 3200,
    createdBy: '3',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'exp-2',
    title: 'Design Summit 2024',
    description:
      'Конференция и выставка для дизайнеров и творческих профессионалов. Мастер-классы, лекции и нетворкинг.',
    startDate: new Date('2024-04-10'),
    endDate: new Date('2024-04-12'),
    location: 'Санкт-Петербург, Манеж',
    image: '/exhibitions/design-summit.jpg',
    status: 'published',
    participantCount: 85,
    registrations: 1800,
    createdBy: '3',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: 'exp-3',
    title: 'Business Forum 2024',
    description:
      'Форум для бизнес-лидеров и предпринимателей. Обсуждение стратегий развития и создание новых деловых контактов.',
    startDate: new Date('2024-05-20'),
    endDate: new Date('2024-05-22'),
    location: 'Казань, Конгресс-центр "Казань"',
    image: '/exhibitions/business-forum.jpg',
    status: 'draft',
    participantCount: 45,
    registrations: 800,
    createdBy: '3',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-20'),
  },
]

// Mock новости
export const mockNews: News[] = [
  {
    id: 'news-1',
    title: 'TechExpo 2024 регистрация открыта',
    excerpt: 'Начните регистрацию на главную техническую выставку года',
    content:
      'Регистрация на TechExpo 2024 официально открыта! Присоединяйтесь к 3000+ участникам и узнайте о самых инновационных решениях в IT индустрии. Событие состоится 15-18 марта в МВЦ "Крокус Экспо".',
    image: '/news/techexpo-registration.jpg',
    publishedAt: new Date('2024-01-20'),
    createdBy: '3',
    status: 'published',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'news-2',
    title: 'Новые спикеры подтверждены на Design Summit',
    excerpt: 'Объявлены имена знаменитых дизайнеров',
    content:
      'Мы рады сообщить о присутствии топовых дизайнеров на Design Summit 2024. В программе лекции о трендах веб-дизайна, мобильного интерфейса и брендинга. Зарегистрируйтесь для участия!',
    image: '/news/design-speakers.jpg',
    publishedAt: new Date('2024-01-18'),
    createdBy: '3',
    status: 'published',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  },
]

// Mock участники выставки
export const mockParticipants: ExhibitionParticipant[] = [
  {
    id: 'part-1',
    exhibitionId: 'exp-1',
    userId: '2',
    companyName: 'TechCorp Solutions',
    boothNumber: 'A-42',
    status: 'confirmed',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'part-2',
    exhibitionId: 'exp-1',
    userId: '4',
    companyName: 'Digital Innovations',
    boothNumber: 'B-15',
    status: 'registered',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
]

// Хранилище текущего пользователя
let currentUser: User | null = null

export const setCurrentUser = (user: User | null) => {
  currentUser = user
}

export const getCurrentUser = (): User | null => {
  return currentUser
}
