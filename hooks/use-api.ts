"use client"

import { useState, useEffect } from "react"
import { handleAPIError } from "@/lib/api"

interface UseAPIOptions<T> {
  initialData?: T
  immediate?: boolean
}

interface UseAPIReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (...args: any[]) => Promise<T>
  reset: () => void
}

export function useAPI<T = any>(
  apiFunction: (...args: any[]) => Promise<any>,
  options: UseAPIOptions<T> = {},
): UseAPIReturn<T> {
  const { initialData = null, immediate = false } = options

  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async (...args: any[]): Promise<T> => {
    try {
      setLoading(true)
      setError(null)

      const result = await apiFunction(...args)
      setData(result)
      return result
    } catch (err: any) {
      const errorMessage = handleAPIError(err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setData(initialData)
    setLoading(false)
    setError(null)
  }

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate])

  return { data, loading, error, execute, reset }
}


export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setLoading(true)
      setError(null)

      const { authAPI, tokenManager } = await import("@/lib/api")
      const response = await authAPI.login(credentials)

      tokenManager.setToken(response.token)
      setUser(response.user)

      return response
    } catch (err: any) {
      const errorMessage = handleAPIError(err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      const { authAPI, tokenManager } = await import("@/lib/api")
      await authAPI.logout()
      tokenManager.removeToken()
      setUser(null)
    } catch (err: any) {
      console.error("Logout error:", err)
    }
  }

  const checkAuth = async () => {
    try {
      setLoading(true)
      const { authAPI, tokenManager } = await import("@/lib/api")

      const token = tokenManager.getToken()
      if (!token || tokenManager.isTokenExpired(token)) {
        tokenManager.removeToken()
        setUser(null)
        return
      }

      const response = await authAPI.getMe()
      setUser(response.user)
    } catch (err: any) {
      const { tokenManager } = await import("@/lib/api")
      tokenManager.removeToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return { user, loading, error, login, logout, checkAuth }
}

export function useProducts(params?: any) {
  return useAPI(
    async () => {
      const { productsAPI } = await import("@/lib/api")
      return productsAPI.getAll(params)
    },
    { immediate: true },
  )
}

export function useBookings(params?: any) {
  return useAPI(
    async () => {
      const { bookingsAPI } = await import("@/lib/api")
      return bookingsAPI.getAll(params)
    },
    { immediate: true },
  )
}

export function useNotifications(params?: any) {
  return useAPI(
    async () => {
      const { notificationsAPI } = await import("@/lib/api")
      return notificationsAPI.getAll(params)
    },
    { immediate: true },
  )
}
