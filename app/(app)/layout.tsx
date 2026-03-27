"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/context"
import { MainNav, BottomNav } from "@/components/navigation"

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isHydrating } = useApp()

  useEffect(() => {
    if (!isHydrating && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isHydrating, router])

  if (isHydrating || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainNav />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutContent>{children}</AppLayoutContent>
}
