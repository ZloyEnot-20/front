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

/** POST/PUT с FormData (multipart). Не ставит Content-Type — браузер подставит boundary. */
async function apiFormData<T>(path: string, formData: FormData, method: 'POST' | 'PUT' = 'POST'): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = { Authorization: `Bearer ${token}` }
  const res = await fetch(`${API_URL}${path}`, { method, headers, body: formData })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Ошибка запроса')
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
  create: (data: Partial<ApiUser> & { email: string; name: string; password?: string }) =>
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
  createFormData: (formData: FormData) => apiFormData<ApiExhibition>('/api/exhibitions', formData, 'POST'),
  update: (id: string, data: Partial<ApiExhibition>) =>
    api<ApiExhibition>(`/api/exhibitions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateFormData: (id: string, formData: FormData) => apiFormData<ApiExhibition>(`/api/exhibitions/${id}`, formData, 'PUT'),
  delete: (id: string) => api<void>(`/api/exhibitions/${id}`, { method: 'DELETE' }),
}

// Registrations
export const registrationsApi = {
  list: () => api<ApiRegistration[]>('/api/registrations'),
  /** Все регистрации (админ) */
  listAll: () => api<ApiRegistration[]>('/api/registrations/all'),
  create: (data: { exhibitionId: string; city: string }) =>
    api<ApiRegistration>('/api/registrations', { method: 'POST', body: JSON.stringify(data) }),
}

export interface ApiScanLogItem {
  id: string
  scannedAt: string
  scannedByUserId: string
  deviceId?: string
  success: boolean
  errorMessage?: string
  registration: { id: string; firstName: string; lastName: string; email: string; city: string } | null
  exhibition: { id: string; title: string } | null
}

/** Все логи сканов (админ) */
export const scansApi = {
  listAll: (opts?: { limit?: number }) =>
    api<ApiScanLogItem[]>('/api/registrations/scans/all', {
      params: opts?.limit ? { limit: String(opts.limit) } : undefined,
    }),
}

export type AuditLogType = 'LOGIN' | 'LOGIN_FAILED' | 'CREATE_USER' | 'EDIT' | 'DELETE' | 'PUBLISH'

export interface ApiAuditLogItem {
  id: string
  type: AuditLogType
  userEmail: string
  userId?: string
  action: string
  details?: string
  createdAt: string
}

/** Аудит-логи (админ) */
export const auditLogsApi = {
  list: (opts?: { limit?: number }) =>
    api<ApiAuditLogItem[]>('/api/admin/audit-logs', {
      params: opts?.limit ? { limit: String(opts.limit) } : undefined,
    }),
}

// Загрузка файла на бэкенд (S3 публичный бакет)
export async function uploadFile(file: File): Promise<{ fileId: string; url?: string }> {
  const token = getToken()
  if (!token) throw new Error('Требуется авторизация')
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_URL}/api/upload-url`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = (data as { error?: string }).error ?? ''
    if (res.status === 413 || /entity too large|too large|превышен/i.test(msg)) {
      throw new Error('Файл слишком большой. Максимум 10 МБ.')
    }
    throw new Error(msg || 'Ошибка загрузки')
  }
  return { fileId: (data as { fileId: string }).fileId, url: (data as { url?: string }).url }
}

// URL для отображения изображения (fileId, base64 или http)
export function getImageUrl(image?: string | null): string {
  if (!image) return ''
  if (image.startsWith('data:') || image.startsWith('http')) return image
  return `${API_URL}/api/files/${encodeURIComponent(image)}`
}

// News
export const newsApi = {
  list: () => api<ApiNews[]>('/api/news'),
  get: (id: string) => api<ApiNews>(`/api/news/${id}`),
  create: (data: Partial<ApiNews>) =>
    api<ApiNews>('/api/news', { method: 'POST', body: JSON.stringify(data) }),
  createFormData: (formData: FormData) => apiFormData<ApiNews>('/api/news', formData, 'POST'),
  update: (id: string, data: Partial<ApiNews>) =>
    api<ApiNews>(`/api/news/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateFormData: (id: string, formData: FormData) => apiFormData<ApiNews>(`/api/news/${id}`, formData, 'PUT'),
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
  cities?: string[]
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
