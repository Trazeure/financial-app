'use client'
import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.APP_AUTH)
    setIsAuthenticated(stored === 'true')
    setLoading(false)
  }, [])

  const login = useCallback((username: string, password: string): boolean => {
    if (username === 'trazeure' && password === '291169') {
      localStorage.setItem(STORAGE_KEYS.APP_AUTH, 'true')
      setIsAuthenticated(true)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.APP_AUTH)
    localStorage.removeItem(STORAGE_KEYS.GOOGLE_TOKEN)
    setIsAuthenticated(false)
  }, [])

  return { isAuthenticated, loading, login, logout }
}
