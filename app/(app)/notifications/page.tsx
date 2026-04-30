"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Bell, 
  AlertTriangle, 
  Share2, 
  Shield, 
  Info,
  Check,
  CheckCheck,
  FileText
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/context"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: "expiration" | "share" | "security" | "system"
  title: string
  message: string
  documentId?: string
  isRead: boolean
  createdAt: Date
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "expiration":
      return { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" }
    case "share":
      return { icon: Share2, color: "text-accent", bg: "bg-accent/10" }
    case "security":
      return { icon: Shield, color: "text-destructive", bg: "bg-destructive/10" }
    default:
      return { icon: Info, color: "text-primary", bg: "bg-primary/10" }
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
              : "Toutes les notifications sont lues"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllNotificationsRead} className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Aucune notification</h3>
            <p className="text-muted-foreground">
              Vous n'avez aucune notification pour le moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => {
            const { icon: Icon, color, bg } = getNotificationIcon(notification.type)
            
            return (
              <Card
                key={notification.id}
                className={cn(
                  "transition-colors",
                  !notification.isRead && "border-primary/50 bg-primary/5"
                )}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-full shrink-0", bg)}>
                    <Icon className={cn("h-6 w-6", color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={cn("font-semibold", !notification.isRead && "text-primary")}>
                          {notification.title}
                        </h3>
                        <p className="text-muted-foreground">{notification.message}</p>
                      </div>
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                    </div>
                    
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </span>
                      
                      {notification.documentId && (
                        <Link
                          href={`/library/${notification.documentId}`}
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <FileText className="h-3 w-3" />
                          Voir le document
                        </Link>
                      )}
                      
                      {!notification.isRead && (
                        <button
                          onClick={() => markNotificationRead(notification.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Check className="h-3 w-3" />
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
