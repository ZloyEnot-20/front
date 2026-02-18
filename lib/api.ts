const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export async function api<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
  const { params, ...fetchOptions } = options
  let url = `${API_URL}${path}`
  if (params && Object.keys(params).length) {
    url += '?' + new URLSearchParams(params).toString()
  }
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { ...fetchOptions, headers })
  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? 'Ошибка запроса')
  return data as T
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api<{ user: ApiUser; token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, name: string, password: string, role?: string) =>
    api<{ user: ApiUser; token: string }>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, name, password, role }) }),
  me: () => api<ApiUser>('/api/auth/me'),
}

// Users (admin)
export const usersApi = {
  list: () => api<ApiUser[]>('/api/users'),
  get: (id: string) => api<ApiUser>(`/api/users/${id}`),
  create: (data: Partial<ApiUser> & { email: string; name: string }) =>
    api<ApiUser>('/api/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ApiUser>) =>
    api<ApiUser>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => api<void>(`/api/users/${id}`, { method: 'DELETE' }),
}

// Exhibitions
export const exhibitionsApi = {
  list: () => api<ApiExhibition[]>('/api/exhibitions'),
  get: (id: string) => api<ApiExhibition>(`/api/exhibitions/${id}`),
  create: (data: Partial<ApiExhibition>) =>
    api<ApiExhibition>('/api/exhibitions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ApiExhibition>) =>
    api<ApiExhibition>(`/api/exhibitions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => api<void>(`/api/exhibitions/${id}`, { method: 'DELETE' }),
}

// Registrations
export const registrationsApi = {
  list: () => api<ApiRegistration[]>('/api/registrations'),
  create: (data: { exhibitionId: string; city: string }) =>
    api<ApiRegistration>('/api/registrations', { method: 'POST', body: JSON.stringify(data) }),
}

// Upload
export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData()
  formData.append('image', file)
  const token = getToken()
  const headers: HeadersInit = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? 'Ошибка загрузки')
  return data
}

// News
export const newsApi = {
  list: () => api<ApiNews[]>('/api/news'),
  get: (id: string) => api<ApiNews>(`/api/news/${id}`),
  create: (data: Partial<ApiNews>) =>
    api<ApiNews>('/api/news', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ApiNews>) =>
    api<ApiNews>(`/api/news/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => api<void>(`/api/news/${id}`, { method: 'DELETE' }),
}

// API types (match backend response)
export interface ApiUser {
  id: string
  email: string
  name: string
  role: string
  status?: string
  avatar?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface ApiExhibition {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  image?: string
  status: string
  participantCount: number
  registrations: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ApiRegistration {
  id: string
  exhibitionId: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  qrCode: string
  status: string
  registeredAt: string
  cancelledAt?: string
  createdAt: string
  updatedAt: string
}

export interface ApiNews {
  id: string
  title: string
  content: string
  excerpt: string
  image?: string
  publishedAt: string
  createdBy: string
  status: string
  createdAt: string
  updatedAt: string
}
