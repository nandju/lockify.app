"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Types
export interface Document {
  id: string
  name: string
  category: "identity" | "health" | "finance" | "work" | "housing" | "family" | "legal" | "other"
  tags: string[]
  fileType: "pdf" | "jpg" | "png" | "docx" | "xlsx"
  size: number
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
  isFavorite: boolean
  thumbnailUrl?: string
}

export interface Folder {
  id: string
  name: string
  parentId: string | null
  color: string
  documentCount: number
}

export interface Share {
  id: string
  documentId: string
  documentName: string
  recipientEmail?: string
  linkUrl?: string
  permissions: "read" | "download"
  expiresAt: Date
  createdAt: Date
  accessCount: number
  isActive: boolean
}

export interface Notification {
  id: string
  type: "expiration" | "share" | "security" | "system"
  title: string
  message: string
  documentId?: string
  isRead: boolean
  createdAt: Date
}

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  isPremium: boolean
  storageUsed: number
  storageLimit: number
  twoFactorEnabled: boolean
  biometricsEnabled: boolean
  pinEnabled: boolean
}

interface AppState {
  user: User | null
  isAuthenticated: boolean
  documents: Document[]
  folders: Folder[]
  shares: Share[]
  notifications: Notification[]
  isDarkMode: boolean
  currentFolder: string | null
  isHydrating: boolean
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  toggleDarkMode: () => void
  setCurrentFolder: (folderId: string | null) => void
  addDocument: (doc: Omit<Document, "id" | "createdAt" | "updatedAt">) => void
  deleteDocument: (id: string) => void
  toggleFavorite: (id: string) => void
  createShare: (share: Omit<Share, "id" | "createdAt" | "accessCount">) => void
  revokeShare: (id: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// TODO: Replace with proper API integration
// Mock data removed - use proper API calls through hooks instead

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    isAuthenticated: false,
    documents: [],
    folders: [],
    shares: [],
    notifications: [],
    isDarkMode: false,
    currentFolder: null,
    isHydrating: true,
  })

  useEffect(() => {
    // Check for dark mode preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const savedDarkMode = localStorage.getItem("lockify-dark-mode")
    const isDark = savedDarkMode ? savedDarkMode === "true" : prefersDark

    if (isDark) {
      document.documentElement.classList.add("dark")
    }

    // Check for saved auth state
    const savedAuth = localStorage.getItem("lockify-auth")
    if (savedAuth === "true") {
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        isDarkMode: isDark,
        isHydrating: false,
      }))
    } else {
      setState(prev => ({ ...prev, isDarkMode: isDark, isHydrating: false }))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // TODO: Replace with actual API call using auth service
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (email && password) {
      localStorage.setItem("lockify-auth", "true")
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
      }))
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem("lockify-auth")
    setState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      documents: [],
      folders: [],
      shares: [],
      notifications: [],
    }))
  }

  const toggleDarkMode = () => {
    const newDarkMode = !state.isDarkMode
    localStorage.setItem("lockify-dark-mode", String(newDarkMode))
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    
    setState(prev => ({ ...prev, isDarkMode: newDarkMode }))
  }

  const setCurrentFolder = (folderId: string | null) => {
    setState(prev => ({ ...prev, currentFolder: folderId }))
  }

  const addDocument = (doc: Omit<Document, "id" | "createdAt" | "updatedAt">) => {
    const newDoc: Document = {
      ...doc,
      id: String(Date.now()),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setState(prev => ({
      ...prev,
      documents: [newDoc, ...prev.documents],
    }))
  }

  const deleteDocument = (id: string) => {
    setState(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== id),
    }))
  }

  const toggleFavorite = (id: string) => {
    setState(prev => ({
      ...prev,
      documents: prev.documents.map(d =>
        d.id === id ? { ...d, isFavorite: !d.isFavorite } : d
      ),
    }))
  }

  const createShare = (share: Omit<Share, "id" | "createdAt" | "accessCount">) => {
    const newShare: Share = {
      ...share,
      id: String(Date.now()),
      createdAt: new Date(),
      accessCount: 0,
    }
    setState(prev => ({
      ...prev,
      shares: [newShare, ...prev.shares],
    }))
  }

  const revokeShare = (id: string) => {
    setState(prev => ({
      ...prev,
      shares: prev.shares.map(s =>
        s.id === id ? { ...s, isActive: false } : s
      ),
    }))
  }

  const markNotificationRead = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }))
  }

  const markAllNotificationsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, isRead: true })),
    }))
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        toggleDarkMode,
        setCurrentFolder,
        addDocument,
        deleteDocument,
        toggleFavorite,
        createShare,
        revokeShare,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

// Helper functions
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Go`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function getCategoryLabel(category: Document["category"]): string {
  const labels: Record<Document["category"], string> = {
    identity: "Identité",
    health: "Santé",
    finance: "Finance",
    work: "Travail",
    housing: "Logement",
    family: "Famille",
    legal: "Juridique",
    other: "Autre",
  }
  return labels[category]
}

export function getCategoryColor(category: Document["category"]): string {
  const colors: Record<Document["category"], string> = {
    identity: "#1565C0",
    health: "#00C853",
    finance: "#FFB300",
    work: "#00BCD4",
    housing: "#9C27B0",
    family: "#E91E63",
    legal: "#607D8B",
    other: "#78909C",
  }
  return colors[category]
}

export function daysUntilExpiration(date: Date): number {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
