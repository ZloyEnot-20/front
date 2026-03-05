'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { User } from './types'
import { authApi, RegisterPayload, type ApiUser } from './api'

export interface UserContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signup: (payload: RegisterPayload) => Promise<void>
  refreshUser: () => Promise<void>
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

function toUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    role: apiUser.role as User['role'],
    status: apiUser.status as User['status'],
    avatar: apiUser.avatar,
    phone: apiUser.phone,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    city: apiUser.city,
    visitorStatus: apiUser.visitorStatus,
    languageKnowledge: apiUser.languageKnowledge,
    interest: apiUser.interest,
    countryOfInterest: apiUser.countryOfInterest,
    admissionPlan: apiUser.admissionPlan,
    exhibitorDescription: apiUser.exhibitorDescription,
    exhibitorAddress: apiUser.exhibitorAddress,
    exhibitorWebsite: apiUser.exhibitorWebsite,
    exhibitorPhotos: apiUser.exhibitorPhotos,
    createdAt: new Date(apiUser.createdAt),
    updatedAt: new Date(apiUser.updatedAt),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setUser(null)
      return
    }
    try {
      const data = await authApi.me()
      setUser(toUser(data))
    } catch {
      localStorage.removeItem('token')
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      authApi.me()
        .then((data) => setUser(toUser(data)))
        .catch(() => {
          localStorage.removeItem('token')
          setUser(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { user: u, token } = await authApi.login(email, password)
      localStorage.setItem('token', token)
      setUser(toUser(u))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const signup = async (payload: RegisterPayload) => {
    setIsLoading(true)
    try {
      const { user: u, token } = await authApi.register(payload)
      localStorage.setItem('token', token)
      setUser(toUser(u))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout, signup, refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within AuthProvider')
  }
  return context
}
