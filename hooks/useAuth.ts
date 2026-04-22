"use client"

import { useCallback, useEffect, useState } from "react"
import {
  getCurrentUser,
  login as loginService,
  logout as logoutService,
  type AuthUser,
} from "@/services/auth.service"
import { extractErrorMessage } from "@/lib/errors"

interface LoginInput {
  email: string
  password: string
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async ({ email, password }: LoginInput) => {
    setLoading(true)
    setError(null)

    try {
      const currentUser = await loginService({ email, password })
      setUser(currentUser)
      return currentUser
    } catch (err) {
      const message = extractErrorMessage(err)
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    logoutService()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  return {
    user,
    loading,
    error,
    login,
    logout,
    refreshUser,
  }
}
