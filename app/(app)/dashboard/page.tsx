"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  FileText, 
  Clock, 
  Star, 
  Share2, 
  AlertTriangle,
  HardDrive,
  ChevronRight,
  Plus,
  Eye
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useApp, formatFileSize, formatDate, getCategoryLabel, getCategoryColor, daysUntilExpiration } from "@/lib/context"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { useDocuments } from "@/hooks/useDocuments"

export default function DashboardPage() {
  const { shares } = useApp()
  const { user, loading: authLoading } = useAuth()
  const {
    documents,
    fetchDocuments,
    loading: documentsLoading,
  } = useDocuments()
  const safeDocuments = documents ?? []
  const safeUser = user ?? null

  const [totalDocuments, setTotalDocuments] = useState(0)
  const [storageUsed, setStorageUsed] = useState(0)
  const [activeShares, setActiveShares] = useState(0)

  useEffect(() => {
    if (!user?.id) return
    void fetchDocuments(user.id)
  }, [fetchDocuments, user?.id])

  useEffect(() => {
    setTotalDocuments(safeDocuments.length)
  }, [safeDocuments])

  useEffect(() => {
    setStorageUsed(safeUser?.storageUsed ?? 0)
  }, [safeUser])

  useEffect(() => {
    setActiveShares((shares ?? []).filter(s => s.isActive).length)
  }, [shares])

  const recentDocuments = safeDocuments.slice(0, 4)
  const favoriteDocuments = safeDocuments.filter(d => d.isFavorite).slice(0, 3)
  const expiringDocuments = safeDocuments
    .filter(d => d.expiresAt && daysUntilExpiration(d.expiresAt) <= 30 && daysUntilExpiration(d.expiresAt) > 0)
    .sort((a, b) => daysUntilExpiration(a.expiresAt!) - daysUntilExpiration(b.expiresAt!))
    .slice(0, 3)
  const activeSharesList = (shares ?? []).filter(s => s.isActive).slice(0, 3)

  const storageUsedPercent = safeUser ? (storageUsed / (safeUser.storageLimit || 1)) * 100 : 0

  if (authLoading || documentsLoading) return <p>Loading...</p>

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Bonjour, {(safeUser ?? null)?.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            Bienvenue sur votre espace sécurisé
          </p>
        </div>
        <Link href="/import">
          <Button className="gap-2">
            <Plus className="h-5 w-5" />
            Ajouter un document
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalDocuments || 0}</p>
              <p className="text-sm text-muted-foreground">Documents</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <Share2 className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeShares || 0}</p>
              <p className="text-sm text-muted-foreground">Partages actifs</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{favoriteDocuments.length}</p>
              <p className="text-sm text-muted-foreground">Favoris</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{expiringDocuments.length}</p>
              <p className="text-sm text-muted-foreground">Expirent bientôt</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storage */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <HardDrive className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium">Espace de stockage</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(storageUsed || 0)} / {formatFileSize(safeUser?.storageLimit || 0)}
                </p>
              </div>
              <Progress value={storageUsedPercent} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Documents récents
            </CardTitle>
            <Link href="/library" className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentDocuments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun document récent
              </p>
            ) : (
              recentDocuments.map(doc => (
                <Link
                  key={doc.id}
                  href={`/library/${doc.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${getCategoryColor(doc.category)}20` }}
                  >
                    <FileText className="h-5 w-5" style={{ color: getCategoryColor(doc.category) }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryLabel(doc.category)} • {formatFileSize(doc.size)}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Expiring Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Documents expirant bientôt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiringDocuments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun document en cours d'expiration
              </p>
            ) : (
              expiringDocuments.map(doc => {
                const days = daysUntilExpiration(doc.expiresAt!)
                return (
                  <Link
                    key={doc.id}
                    href={`/library/${doc.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${getCategoryColor(doc.category)}20` }}
                    >
                      <FileText className="h-5 w-5" style={{ color: getCategoryColor(doc.category) }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Expire le {formatDate(doc.expiresAt!)}
                      </p>
                    </div>
                    <Badge
                      variant="destructive"
                      className={cn(
                        days <= 7 ? "bg-destructive" : days <= 15 ? "bg-orange-500" : "bg-yellow-500",
                        "text-white"
                      )}
                    >
                      {days} jour{days > 1 ? "s" : ""}
                    </Badge>
                  </Link>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Favorites */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Favoris
            </CardTitle>
            <Link href="/library?filter=favorites" className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {favoriteDocuments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun document favori
              </p>
            ) : (
              favoriteDocuments.map(doc => (
                <Link
                  key={doc.id}
                  href={`/library/${doc.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${getCategoryColor(doc.category)}20` }}
                  >
                    <FileText className="h-5 w-5" style={{ color: getCategoryColor(doc.category) }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryLabel(doc.category)}
                    </p>
                  </div>
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Active Shares */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-accent" />
              Partages actifs
            </CardTitle>
            <Link href="/sharing" className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeSharesList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun partage actif
              </p>
            ) : (
              activeSharesList.map(share => (
                <div
                  key={share.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Share2 className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{share.documentName}</p>
                    <p className="text-sm text-muted-foreground">
                      {share.recipientEmail || "Lien public"} • {share.accessCount} accès
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    {share.accessCount}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
