"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Trash2, 
  Star, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2,
  Moon,
  FileText,
  Calendar,
  Tag,
  HardDrive,
  Clock,
  MoreVertical,
  Edit,
  Copy,
  Printer,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { 
  useApp, 
  formatFileSize, 
  formatDate, 
  getCategoryLabel, 
  getCategoryColor,
  daysUntilExpiration 
} from "@/lib/context"
import { cn } from "@/lib/utils"

export default function DocumentViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { documents, toggleFavorite, deleteDocument } = useApp()
  
  const document = documents.find(d => d.id === resolvedParams.id)
  
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isNightMode, setIsNightMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showShareSuccess, setShowShareSuccess] = useState(false)

  // Mock data for PDF
  const totalPages = 3

  if (!document) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="py-16 text-center">
          <CardContent>
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Document non trouvé</h3>
            <p className="mb-4 text-muted-foreground">
              Ce document n'existe pas ou a été supprimé
            </p>
            <Link href="/library">
              <Button>Retour à la bibliothèque</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleDelete = () => {
    deleteDocument(document.id)
    router.push("/library")
  }

  const handleShare = () => {
    router.push(`/sharing?document=${document.id}`)
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)
  
  const handleFullscreen = () => {
    setIsFullscreen(true)
  }

  const expirationDays = document.expiresAt ? daysUntilExpiration(document.expiresAt) : null

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/library">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Retour</span>
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground md:text-2xl">
                  {document.name}
                </h1>
                <button
                  onClick={() => toggleFavorite(document.id)}
                  aria-label={document.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  <Star
                    className={cn(
                      "h-5 w-5 transition-colors",
                      document.isFavorite
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground hover:text-yellow-500"
                    )}
                  />
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: `${getCategoryColor(document.category)}20`,
                    color: getCategoryColor(document.category),
                  }}
                >
                  {getCategoryLabel(document.category)}
                </Badge>
                <span>•</span>
                <span>{formatFileSize(document.size)}</span>
                <span>•</span>
                <span>{document.fileType.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleShare} className="gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Partager</span>
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Télécharger</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Plus d'actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="gap-2">
                  <Edit className="h-4 w-4" />
                  Modifier les infos
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Copy className="h-4 w-4" />
                  Dupliquer
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Printer className="h-4 w-4" />
                  Imprimer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Document Viewer */}
          <div className="lg:col-span-2">
            <Card>
              {/* Viewer toolbar */}
              <div className="flex items-center justify-between border-b border-border p-3">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 50}>
                    <ZoomOut className="h-4 w-4" />
                    <span className="sr-only">Zoom arrière</span>
                  </Button>
                  <span className="w-12 text-center text-sm">{zoom}%</span>
                  <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 200}>
                    <ZoomIn className="h-4 w-4" />
                    <span className="sr-only">Zoom avant</span>
                  </Button>
                  <Separator orientation="vertical" className="mx-2 h-6" />
                  <Button variant="ghost" size="icon" onClick={handleRotate}>
                    <RotateCw className="h-4 w-4" />
                    <span className="sr-only">Rotation</span>
                  </Button>
                  <Button
                    variant={isNightMode ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setIsNightMode(!isNightMode)}
                  >
                    <Moon className="h-4 w-4" />
                    <span className="sr-only">Mode nuit</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleFullscreen}>
                    <Maximize2 className="h-4 w-4" />
                    <span className="sr-only">Plein écran</span>
                  </Button>
                </div>

                {/* Page navigation for PDFs */}
                {document.fileType === "pdf" && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Page précédente</span>
                    </Button>
                    <span className="text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Page suivante</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Document content */}
              <CardContent
                className={cn(
                  "flex min-h-[400px] items-center justify-center overflow-auto p-6 md:min-h-[500px]",
                  isNightMode && "bg-gray-900"
                )}
              >
                <div
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transition: "transform 0.2s ease",
                  }}
                >
                  <div
                    className={cn(
                      "flex h-96 w-72 flex-col items-center justify-center rounded-lg border-2 border-dashed",
                      isNightMode
                        ? "border-gray-600 bg-gray-800 text-gray-300"
                        : "border-border bg-muted/30"
                    )}
                    style={{ borderColor: getCategoryColor(document.category) }}
                  >
                    <FileText
                      className="mb-4 h-24 w-24"
                      style={{ color: getCategoryColor(document.category) }}
                    />
                    <p className="text-lg font-medium">{document.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Page {currentPage} sur {totalPages}
                    </p>
                    <p className="mt-4 text-xs text-muted-foreground">
                      Aperçu du document
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Info */}
          <div className="space-y-4">
            {/* Expiration warning */}
            {expirationDays !== null && expirationDays <= 30 && expirationDays > 0 && (
              <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/40">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      Expire dans {expirationDays} jour{expirationDays > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Le {formatDate(document.expiresAt!)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Catégorie</p>
                    <p className="font-medium">{getCategoryLabel(document.category)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Taille</p>
                    <p className="font-medium">{formatFileSize(document.size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Format</p>
                    <p className="font-medium">{document.fileType.toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ajouté le</p>
                    <p className="font-medium">{formatDate(document.createdAt)}</p>
                  </div>
                </div>

                {document.expiresAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Expire le</p>
                      <p className="font-medium">{formatDate(document.expiresAt)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {document.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                  Partager ce document
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Download className="h-4 w-4" />
                  Télécharger
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le document "{document.name}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fullscreen viewer */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] h-[95vh] p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Visualisation en plein écran</DialogTitle>
            <DialogDescription>Document en plein écran</DialogDescription>
          </DialogHeader>
          <div className="flex h-full flex-col">
            {/* Fullscreen toolbar */}
            <div className="flex items-center justify-between border-b border-border p-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{document.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-sm">{zoom}%</span>
                <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="mx-2 h-6" />
                <Button variant="ghost" size="icon" onClick={handleRotate}>
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  variant={isNightMode ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setIsNightMode(!isNightMode)}
                >
                  <Moon className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="mx-2 h-6" />
                <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Fullscreen content */}
            <div
              className={cn(
                "flex flex-1 items-center justify-center overflow-auto p-6",
                isNightMode && "bg-gray-900"
              )}
            >
              <div
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: "transform 0.2s ease",
                }}
              >
                <div
                  className={cn(
                    "flex h-[70vh] w-[50vw] flex-col items-center justify-center rounded-lg border-2 border-dashed",
                    isNightMode
                      ? "border-gray-600 bg-gray-800 text-gray-300"
                      : "border-border bg-muted/30"
                  )}
                  style={{ borderColor: getCategoryColor(document.category) }}
                >
                  <FileText
                    className="mb-4 h-32 w-32"
                    style={{ color: getCategoryColor(document.category) }}
                  />
                  <p className="text-2xl font-medium">{document.name}</p>
                  <p className="text-muted-foreground">Aperçu du document</p>
                </div>
              </div>
            </div>

            {/* Page navigation */}
            {document.fileType === "pdf" && (
              <div className="flex items-center justify-center gap-4 border-t border-border p-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Précédent
                </Button>
                <span>
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
