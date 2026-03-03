'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Exhibition, News, User, ExhibitionRegistration } from './types'
import { exhibitionsApi, newsApi, usersApi, registrationsApi, ApiUser } from './api'
import { useAuth } from './auth-context'

function toExhibition(e: { id: string; title: string; description: string; startDate: string; endDate: string; cities?: { id: string; name: string }[]; participants?: { id: string; name: string; avatar?: string; exhibitorDescription?: string; exhibitorAddress?: string; exhibitorWebsite?: string; exhibitorPhotos?: string[] }[]; image?: string; banner?: string; images?: string[]; status: string; participantCount: number; registrations: number; createdBy: string; createdAt: string; updatedAt: string }): Exhibition {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    startDate: new Date(e.startDate),
    endDate: new Date(e.endDate),
    cities: e.cities ?? [],
    participants: e.participants ?? [],
    image: e.banner ?? e.image,
    banner: e.banner,
    images: e.images ?? [],
    status: e.status as Exhibition['status'],
    participantCount: e.participantCount,
    registrations: e.registrations,
    createdBy: e.createdBy,
    createdAt: new Date(e.createdAt),
    updatedAt: new Date(e.updatedAt),
  }
}

function toNews(n: { id: string; title: string; content: string; excerpt: string; image?: string; banner?: string; images?: string[]; publishedAt: string; createdBy: string; status: string; createdAt: string; updatedAt: string }): News {
  return {
    id: n.id,
    title: n.title,
    content: n.content,
    excerpt: n.excerpt,
    image: n.banner ?? n.image,
    banner: n.banner,
    images: n.images ?? [],
    publishedAt: new Date(n.publishedAt),
    createdBy: n.createdBy,
    status: n.status as News['status'],
    createdAt: new Date(n.createdAt),
    updatedAt: new Date(n.updatedAt),
  }
}

function toUser(u: { id: string; email: string; name: string; role: string; status?: string; avatar?: string; phone?: string; createdAt: string; updatedAt: string }): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role as User['role'],
    status: u.status as User['status'],
    avatar: u.avatar,
    phone: u.phone,
    createdAt: new Date(u.createdAt),
    updatedAt: new Date(u.updatedAt),
  }
}

interface AdminContextType {
  exhibitions: Exhibition[]
  news: News[]
  users: User[]
  registrations: ExhibitionRegistration[]
  isLoading: boolean
  refresh: () => Promise<void>
  addExhibition: (exhibition: Exhibition) => Promise<void>
  addExhibitionFormData: (formData: FormData) => Promise<void>
  updateExhibition: (id: string, exhibition: Partial<Exhibition>) => Promise<void>
  updateExhibitionFormData: (id: string, formData: FormData) => Promise<void>
  deleteExhibition: (id: string) => Promise<void>
  addNews: (news: News) => Promise<void>
  addNewsFormData: (formData: FormData) => Promise<void>
  updateNews: (id: string, news: Partial<News>) => Promise<void>
  updateNewsFormData: (id: string, formData: FormData) => Promise<void>
  deleteNews: (id: string) => Promise<void>
  updateUser: (id: string, user: Partial<User>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  addUser: (user: User) => Promise<void>
  addRegistration: (registration: ExhibitionRegistration) => void
  incrementExhibitionRegistrations: (exhibitionId: string) => void
  getRegistrationsByUser: (userId: string) => ExhibitionRegistration[]
  getRegistrationsByExhibition: (exhibitionId: string) => ExhibitionRegistration[]
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [news, setNews] = useState<News[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [registrations, setRegistrations] = useState<ExhibitionRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const [ex, nw] = await Promise.all([exhibitionsApi.list(), newsApi.list()])
      setExhibitions(ex.map(toExhibition))
      setNews(nw.map(toNews))
      try {
        const us = await usersApi.list()
        setUsers(us.map(toUser))
      } catch {
        setUsers([])
      }
      try {
        const regs = await registrationsApi.list()
        setRegistrations(regs.map((r) => ({
          id: r.id,
          exhibitionId: r.exhibitionId,
          userId: r.userId,
          firstName: r.firstName,
          lastName: r.lastName,
          email: r.email,
          phone: r.phone,
          city: r.city,
          qrCode: r.qrCode,
          status: r.status as 'registered' | 'cancelled',
          registeredAt: new Date(r.registeredAt),
          cancelledAt: r.cancelledAt ? new Date(r.cancelledAt) : undefined,
        })))
      } catch {
        setRegistrations([])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Повторная загрузка когда пользователь уже залогинен (исправляет случай, когда при первом mount токен ещё не применён)
  useEffect(() => {
    if (user?.id) refresh()
  }, [user?.id, refresh])

  const addExhibition = async (exhibition: Exhibition) => {
    const cityIds = Array.isArray(exhibition.cities)
      ? exhibition.cities.map((c) => (typeof c === 'string' ? c : c.id))
      : []
    const participantIds = Array.isArray(exhibition.participants)
      ? exhibition.participants.map((p) => (typeof p === 'string' ? p : p.id))
      : []
    const created = await exhibitionsApi.create({
      ...exhibition,
      cities: cityIds,
      participants: participantIds,
      startDate: exhibition.startDate instanceof Date ? exhibition.startDate.toISOString() : (exhibition.startDate as unknown as string),
      endDate: exhibition.endDate instanceof Date ? exhibition.endDate.toISOString() : (exhibition.endDate as unknown as string),
      createdAt: exhibition.createdAt instanceof Date ? exhibition.createdAt.toISOString() : (exhibition.createdAt as unknown as string),
      updatedAt: exhibition.updatedAt instanceof Date ? exhibition.updatedAt.toISOString() : (exhibition.updatedAt as unknown as string),
    })
    setExhibitions((prev) => [toExhibition(created), ...prev])
  }

  const addExhibitionFormData = async (formData: FormData) => {
    const created = await exhibitionsApi.createFormData(formData)
    setExhibitions((prev) => [toExhibition(created), ...prev])
  }

  const updateExhibitionFormData = async (id: string, formData: FormData) => {
    const updated = await exhibitionsApi.updateFormData(id, formData)
    setExhibitions((prev) => prev.map((e) => (e.id === id ? toExhibition(updated) : e)))
  }

  const updateExhibition = async (id: string, updates: Partial<Exhibition>) => {
    const payload: Record<string, unknown> = { ...updates }
    if (updates.startDate) payload.startDate = updates.startDate instanceof Date ? updates.startDate.toISOString() : updates.startDate
    if (updates.endDate) payload.endDate = updates.endDate instanceof Date ? updates.endDate.toISOString() : updates.endDate
    if (Array.isArray(updates.cities)) {
      payload.cities = updates.cities.map((c) => (typeof c === 'string' ? c : c.id))
    }
    if (Array.isArray(updates.participants)) {
      payload.participants = updates.participants.map((p) => (typeof p === 'string' ? p : p.id))
    }
    const updated = await exhibitionsApi.update(id, payload)
    setExhibitions((prev) => prev.map((e) => (e.id === id ? toExhibition(updated) : e)))
  }

  const deleteExhibition = async (id: string) => {
    await exhibitionsApi.delete(id)
    setExhibitions((prev) => prev.filter((e) => e.id !== id))
  }

  const addNews = async (newsItem: News) => {
    const created = await newsApi.create({
      ...newsItem,
      // Ensure publishedAt is a string, and createdAt/updatedAt are also strings (ISO), to fix type errors
      publishedAt:
        newsItem.publishedAt instanceof Date
          ? newsItem.publishedAt.toISOString()
          : (newsItem.publishedAt as unknown as string),
      createdAt:
        newsItem.createdAt instanceof Date
          ? newsItem.createdAt.toISOString()
          : (newsItem.createdAt as unknown as string),
      updatedAt:
        newsItem.updatedAt instanceof Date
          ? newsItem.updatedAt.toISOString()
          : (newsItem.updatedAt as unknown as string),
    })
    setNews((prev) => [toNews(created), ...prev])
  }

  const addNewsFormData = async (formData: FormData) => {
    const created = await newsApi.createFormData(formData)
    setNews((prev) => [toNews(created), ...prev])
  }

  const updateNewsFormData = async (id: string, formData: FormData) => {
    const updated = await newsApi.updateFormData(id, formData)
    setNews((prev) => prev.map((n) => (n.id === id ? toNews(updated) : n)))
  }

  const updateNews = async (id: string, updates: Partial<News>) => {
    const payload: Record<string, unknown> = { ...updates }
    if (updates.publishedAt) payload.publishedAt = updates.publishedAt instanceof Date ? updates.publishedAt.toISOString() : updates.publishedAt
    const updated = await newsApi.update(id, payload)
    setNews((prev) => prev.map((n) => (n.id === id ? toNews(updated) : n)))
  }

  const deleteNews = async (id: string) => {
    await newsApi.delete(id)
    setNews((prev) => prev.filter((n) => n.id !== id))
  }

  const updateUser = async (id: string, updates: Partial<User>) => {
    const payload: Record<string, unknown> = { ...updates }
    if (updates.createdAt) payload.createdAt = updates.createdAt instanceof Date ? updates.createdAt.toISOString() : updates.createdAt
    if (updates.updatedAt) payload.updatedAt = updates.updatedAt instanceof Date ? updates.updatedAt.toISOString() : updates.updatedAt
    const updated = await usersApi.update(id, payload as Partial<ApiUser>)
    setUsers((prev) => prev.map((u) => (u.id === id ? toUser(updated) : u)))
  }

  const deleteUser = async (id: string) => {
    await usersApi.delete(id)
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  const addUser = async (user: User) => {
    const created = await usersApi.create({
      email: user.email,
      name: user.name,
      role: user.role,
      password: (user as User & { password?: string }).password,
      status: (user as User & { status?: string }).status ?? 'active',
      avatar: user.avatar,
      phone: (user as User & { phone?: string }).phone,
    })
    setUsers((prev) => [toUser(created), ...prev])
  }

  const addRegistration = (registration: ExhibitionRegistration) => {
    setRegistrations((prev) => [...prev, registration])
  }

  const incrementExhibitionRegistrations = (exhibitionId: string) => {
    setExhibitions((prev) =>
      prev.map((e) => (e.id === exhibitionId ? { ...e, registrations: e.registrations + 1 } : e))
    )
  }

  const getRegistrationsByUser = (userId: string) => {
    return registrations.filter((r) => r.userId === userId && r.status === 'registered')
  }

  const getRegistrationsByExhibition = (exhibitionId: string) => {
    return registrations.filter((r) => r.exhibitionId === exhibitionId && r.status === 'registered')
  }

  return (
    <AdminContext.Provider
      value={{
        exhibitions,
        news,
        users,
        registrations,
        isLoading,
        refresh,
        addExhibition,
        addExhibitionFormData,
        updateExhibition,
        updateExhibitionFormData,
        deleteExhibition,
        addNews,
        addNewsFormData,
        updateNews,
        updateNewsFormData,
        deleteNews,
        updateUser,
        deleteUser,
        addUser,
        addRegistration,
        incrementExhibitionRegistrations,
        getRegistrationsByUser,
        getRegistrationsByExhibition,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}
