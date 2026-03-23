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

// Mock data
const mockUser: User = {
  id: "1",
  email: "marie.dupont@email.com",
  name: "Marie Dupont",
  isPremium: true,
  storageUsed: 2.4 * 1024 * 1024 * 1024, // 2.4 GB
  storageLimit: 10 * 1024 * 1024 * 1024, // 10 GB
  twoFactorEnabled: true,
  biometricsEnabled: false,
  pinEnabled: true,
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Carte d'identité",
    category: "identity",
    tags: ["officiel", "personnel"],
    fileType: "pdf",
    size: 1.2 * 1024 * 1024,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    expiresAt: new Date("2029-01-15"),
    isFavorite: true,
  },
  {
    id: "2",
    name: "Passeport",
    category: "identity",
    tags: ["voyage", "officiel"],
    fileType: "pdf",
    size: 2.5 * 1024 * 1024,
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20"),
    expiresAt: new Date("2026-04-10"),
    isFavorite: true,
  },
  {
    id: "3",
    name: "Attestation de mutuelle",
    category: "health",
    tags: ["santé", "assurance"],
    fileType: "pdf",
    size: 0.8 * 1024 * 1024,
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
    expiresAt: new Date("2024-12-31"),
    isFavorite: false,
  },
  {
    id: "4",
    name: "Fiche de paie - Mars 2024",
    category: "work",
    tags: ["salaire", "comptabilité"],
    fileType: "pdf",
    size: 0.5 * 1024 * 1024,
    createdAt: new Date("2024-03-31"),
    updatedAt: new Date("2024-03-31"),
    isFavorite: false,
  },
  {
    id: "5",
    name: "Contrat de bail",
    category: "housing",
    tags: ["logement", "contrat"],
    fileType: "pdf",
    size: 3.2 * 1024 * 1024,
    createdAt: new Date("2023-09-01"),
    updatedAt: new Date("2023-09-01"),
    expiresAt: new Date("2026-08-31"),
    isFavorite: true,
  },
  {
    id: "6",
    name: "Relevé bancaire - Février",
    category: "finance",
    tags: ["banque", "mensuel"],
    fileType: "pdf",
    size: 0.3 * 1024 * 1024,
    createdAt: new Date("2024-03-05"),
    updatedAt: new Date("2024-03-05"),
    isFavorite: false,
  },
  {
    id: "7",
    name: "Acte de naissance",
    category: "family",
    tags: ["officiel", "famille"],
    fileType: "jpg",
    size: 1.8 * 1024 * 1024,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
    isFavorite: false,
  },
  {
    id: "8",
    name: "Contrat de travail",
    category: "legal",
    tags: ["contrat", "travail"],
    fileType: "pdf",
    size: 1.1 * 1024 * 1024,
    createdAt: new Date("2023-06-15"),
    updatedAt: new Date("2023-06-15"),
    isFavorite: true,
  },
]

const mockFolders: Folder[] = [
  { id: "1", name: "Documents importants", parentId: null, color: "#1565C0", documentCount: 5 },
  { id: "2", name: "Travail", parentId: null, color: "#00BCD4", documentCount: 8 },
  { id: "3", name: "Santé", parentId: null, color: "#00C853", documentCount: 3 },
  { id: "4", name: "Logement", parentId: null, color: "#FFB300", documentCount: 4 },
]

const mockShares: Share[] = [
  {
    id: "1",
    documentId: "5",
    documentName: "Contrat de bail",
    recipientEmail: "proprietaire@email.com",
    permissions: "read",
    expiresAt: new Date("2024-04-30"),
    createdAt: new Date("2024-03-15"),
    accessCount: 3,
    isActive: true,
  },
  {
    id: "2",
    documentId: "4",
    documentName: "Fiche de paie - Mars 2024",
    linkUrl: "https://lockify.app/share/abc123",
    permissions: "download",
    expiresAt: new Date("2024-04-15"),
    createdAt: new Date("2024-03-20"),
    accessCount: 1,
    isActive: true,
  },
]

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "expiration",
    title: "Document bientôt expiré",
    message: "Votre passeport expire dans 30 jours",
    documentId: "2",
    isRead: false,
    createdAt: new Date("2024-03-25"),
  },
  {
    id: "2",
    type: "share",
    title: "Accès au document",
    message: "proprietaire@email.com a consulté votre Contrat de bail",
    documentId: "5",
    isRead: false,
    createdAt: new Date("2024-03-24"),
  },
  {
    id: "3",
    type: "security",
    title: "Nouvelle connexion",
    message: "Connexion depuis un nouvel appareil détectée",
    isRead: true,
    createdAt: new Date("2024-03-23"),
  },
]

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
        user: mockUser,
        isAuthenticated: true,
        documents: mockDocuments,
        folders: mockFolders,
        shares: mockShares,
        notifications: mockNotifications,
        isDarkMode: isDark,
        isHydrating: false,
      }))
    } else {
      setState(prev => ({ ...prev, isDarkMode: isDark, isHydrating: false }))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (email && password) {
      localStorage.setItem("lockify-auth", "true")
      setState(prev => ({
        ...prev,
        user: mockUser,
        isAuthenticated: true,
        documents: mockDocuments,
        folders: mockFolders,
        shares: mockShares,
        notifications: mockNotifications,
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
