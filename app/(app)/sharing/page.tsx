"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { 
  Share2, 
  Link as LinkIcon, 
  Mail, 
  Copy, 
  Check, 
  Eye, 
  Download, 
  Clock, 
  Trash2,
  Plus,
  X,
  FileText,
  Users,
  Globe,
  Lock,
  Calendar,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { formatDate, getCategoryLabel, getCategoryColor, type Share } from "@/lib/context"
import { useAuth } from "@/hooks/useAuth"
import { useDocuments } from "@/hooks/useDocuments"
import { cn } from "@/lib/utils"

const expirationOptions = [
  { value: "1h", label: "1 heure" },
  { value: "24h", label: "24 heures" },
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
]

export default function SharingPage() {
  const searchParams = useSearchParams()
  const preselectedDoc = searchParams.get("document")
  
  const { user } = useAuth()
  const { documents, fetchDocuments, loading } = useDocuments()
  const [shares, setShares] = useState<Share[]>([])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(!!preselectedDoc)
  const [selectedDocument, setSelectedDocument] = useState(preselectedDoc || "")
  const [shareType, setShareType] = useState<"link" | "email">("link")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [permission, setPermission] = useState<"read" | "download">("read")
  const [expiration, setExpiration] = useState("7d")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [shareToRevoke, setShareToRevoke] = useState<string | null>(null)
  const [createdShareLink, setCreatedShareLink] = useState<string | null>(null)

  // Adapter for documents
  const adaptDocumentItem = (item: any) => ({
    id: item.id,
    name: item.fileName || item.name || 'Untitled',
    category: (item.category as any) || "other",
    tags: (item.tags as string[]) || [],
    fileType: (item.fileType as any) || "pdf",
    size: (item.size as number) || 0,
    createdAt: new Date(item.createdAt || Date.now()),
    updatedAt: new Date(item.updatedAt || item.createdAt || Date.now()),
    expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined,
    isFavorite: (item.isFavorite as boolean) || false,
    thumbnailUrl: item.thumbnailUrl,
  })

  const safeDocuments = (documents || []).map(adaptDocumentItem)

  const activeShares = useMemo(() => shares.filter((s: Share) => s.isActive), [shares])
  const expiredShares = useMemo(() => shares.filter((s: Share) => !s.isActive || new Date(s.expiresAt) < new Date()), [shares])

  useEffect(() => {
    if (user?.id) {
      void fetchDocuments(user.id)
    }
  }, [fetchDocuments, user?.id])

  const createShare = (share: Omit<Share, "id" | "createdAt" | "accessCount">) => {
    const newShare: Share = {
      ...share,
      id: String(Date.now()),
      createdAt: new Date(),
      accessCount: 0,
    }
    setShares(prev => [newShare, ...prev])
  }

  const revokeShare = (id: string) => {
    setShares(prev => prev.map(s => s.id === id ? { ...s, isActive: false } : s))
  }

  const handleCreateShare = () => {
    if (!selectedDocument) return

    const doc = safeDocuments.find(d => d.id === selectedDocument)
    if (!doc) return

    const expirationDate = new Date()
    switch (expiration) {
      case "1h":
        expirationDate.setHours(expirationDate.getHours() + 1)
        break
      case "24h":
        expirationDate.setHours(expirationDate.getHours() + 24)
        break
      case "7d":
        expirationDate.setDate(expirationDate.getDate() + 7)
        break
      case "30d":
        expirationDate.setDate(expirationDate.getDate() + 30)
        break
    }

    const newLink = `https://lockify.app/share/${Math.random().toString(36).substring(2, 10)}`

    createShare({
      documentId: selectedDocument,
      documentName: doc.name,
      recipientEmail: shareType === "email" ? recipientEmail : undefined,
      linkUrl: shareType === "link" ? newLink : undefined,
      permissions: permission,
      expiresAt: expirationDate,
      isActive: true,
    })

    setCreatedShareLink(newLink)
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setSelectedDocument("")
    setShareType("link")
    setRecipientEmail("")
    setPermission("read")
    setExpiration("7d")
  }

  const handleCopyLink = (shareId: string, link: string) => {
    navigator.clipboard.writeText(link)
    setCopiedId(shareId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRevoke = (shareId: string) => {
    revokeShare(shareId)
    setShareToRevoke(null)
  }

  if (loading) return <p>Loading...</p>

  const selectedDoc = safeDocuments.find(d => d.id === selectedDocument)

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Partages</h1>
          <p className="text-muted-foreground">Gérez les accès à vos documents</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-5 w-5" />
              Nouveau partage
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Partager un document</DialogTitle>
              <DialogDescription>
                Créez un lien de partage sécurisé ou invitez quelqu'un par email
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Document selection */}
              <div className="space-y-2">
                <Label>Document à partager</Label>
                <Select value={selectedDocument} onValueChange={setSelectedDocument}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un document" />
                  </SelectTrigger>
                  <SelectContent>
                    {safeDocuments.map(doc => (
                      <SelectItem key={doc.id} value={doc.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" style={{ color: getCategoryColor(doc.category) }} />
                          {doc.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDoc && (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${getCategoryColor(selectedDoc.category)}20` }}
                  >
                    <FileText className="h-5 w-5" style={{ color: getCategoryColor(selectedDoc.category) }} />
                  </div>
                  <div>
                    <p className="font-medium">{selectedDoc.name}</p>
                    <p className="text-sm text-muted-foreground">{getCategoryLabel(selectedDoc.category)}</p>
                  </div>
                </div>
              )}

              {/* Share type */}
              <div className="space-y-2">
                <Label>Type de partage</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShareType("link")}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors",
                      shareType === "link"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Globe className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium">Lien de partage</span>
                  </button>
                  <button
                    onClick={() => setShareType("email")}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors",
                      shareType === "email"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Mail className="h-6 w-6 text-accent" />
                    <span className="text-sm font-medium">Invitation email</span>
                  </button>
                </div>
              </div>

              {/* Email input */}
              {shareType === "email" && (
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email du destinataire</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="destinataire@email.com"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                  />
                </div>
              )}

              {/* Permissions */}
              <div className="space-y-2">
                <Label>Permissions</Label>
                <RadioGroup
                  value={permission}
                  onValueChange={value => setPermission(value as "read" | "download")}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-3">
                    <RadioGroupItem value="read" id="read" />
                    <Label htmlFor="read" className="flex flex-1 cursor-pointer items-center gap-3">
                      <Eye className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Lecture seule</p>
                        <p className="text-sm text-muted-foreground">
                          Le destinataire peut uniquement visualiser
                        </p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-3">
                    <RadioGroupItem value="download" id="download" />
                    <Label htmlFor="download" className="flex flex-1 cursor-pointer items-center gap-3">
                      <Download className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Téléchargement autorisé</p>
                        <p className="text-sm text-muted-foreground">
                          Le destinataire peut télécharger le document
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Expiration */}
              <div className="space-y-2">
                <Label>Durée de validité</Label>
                <Select value={expiration} onValueChange={setExpiration}>
                  <SelectTrigger>
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expirationOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleCreateShare}
                disabled={!selectedDocument || (shareType === "email" && !recipientEmail)}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Créer le partage
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Share link created notification */}
      {createdShareLink && (
        <Card className="mb-6 border-green-500 bg-green-50 dark:bg-green-900/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-800 dark:text-green-200">
                Lien de partage créé !
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">{createdShareLink}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(createdShareLink)
                setTimeout(() => setCreatedShareLink(null), 2000)
              }}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copier
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCreatedShareLink(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Share2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeShares.length}</p>
              <p className="text-sm text-muted-foreground">Partages actifs</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <Eye className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {shares.reduce((acc, s) => acc + s.accessCount, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Consultations totales</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{expiredShares.length}</p>
              <p className="text-sm text-muted-foreground">Partages expirés</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shares list */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            <Share2 className="h-4 w-4" />
            Actifs ({activeShares.length})
          </TabsTrigger>
          <TabsTrigger value="expired" className="gap-2">
            <Clock className="h-4 w-4" />
            Expirés ({expiredShares.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {activeShares.length === 0 ? (
            <Card className="py-16 text-center">
              <CardContent>
                <Share2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">Aucun partage actif</h3>
                <p className="mb-4 text-muted-foreground">
                  Créez un partage pour donner accès à vos documents
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau partage
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeShares.map(share => (
                <ShareCard
                  key={share.id}
                  share={share}
                  onCopy={handleCopyLink}
                  onRevoke={() => setShareToRevoke(share.id)}
                  copiedId={copiedId}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="expired" className="mt-4">
          {expiredShares.length === 0 ? (
            <Card className="py-16 text-center">
              <CardContent>
                <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">Aucun partage expiré</h3>
                <p className="text-muted-foreground">
                  Les partages expirés apparaîtront ici
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {expiredShares.map(share => (
                <ShareCard
                  key={share.id}
                  share={share}
                  isExpired
                  copiedId={copiedId}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Revoke confirmation */}
      <AlertDialog open={!!shareToRevoke} onOpenChange={() => setShareToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Révoquer ce partage ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le lien de partage ne sera plus valide et le destinataire perdra l'accès au document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => shareToRevoke && handleRevoke(shareToRevoke)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Révoquer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ShareCard({
  share,
  onCopy,
  onRevoke,
  isExpired = false,
  copiedId,
}: {
  share: Share
  onCopy?: (id: string, link: string) => void
  onRevoke?: () => void
  isExpired?: boolean
  copiedId: string | null
}) {
  const daysLeft = Math.ceil((new Date(share.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <Card className={cn(isExpired && "opacity-60")}>
      <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            {share.recipientEmail ? (
              <Mail className="h-6 w-6 text-primary" />
            ) : (
              <LinkIcon className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{share.documentName}</p>
            <p className="text-sm text-muted-foreground">
              {share.recipientEmail || "Lien public"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            {share.permissions === "read" ? (
              <>
                <Eye className="h-3 w-3" />
                Lecture
              </>
            ) : (
              <>
                <Download className="h-3 w-3" />
                Téléchargement
              </>
            )}
          </Badge>

          <Badge variant="outline" className="gap-1">
            <Eye className="h-3 w-3" />
            {share.accessCount} accès
          </Badge>

          {!isExpired && daysLeft > 0 && (
            <Badge
              variant="outline"
              className={cn(
                daysLeft <= 1
                  ? "border-destructive text-destructive"
                  : daysLeft <= 7
                  ? "border-yellow-500 text-yellow-600"
                  : ""
              )}
            >
              <Clock className="mr-1 h-3 w-3" />
              {daysLeft} jour{daysLeft > 1 ? "s" : ""}
            </Badge>
          )}

          {isExpired && (
            <Badge variant="destructive">Expiré</Badge>
          )}
        </div>

        {!isExpired && (
          <div className="flex items-center gap-2">
            {share.linkUrl && onCopy && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopy(share.id, share.linkUrl!)}
                className="gap-2"
              >
                {copiedId === share.id ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    Copié
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copier
                  </>
                )}
              </Button>
            )}
            {onRevoke && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRevoke}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Révoquer</span>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
