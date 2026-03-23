"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Upload, 
  Camera, 
  FolderOpen, 
  Image as ImageIcon, 
  FileText, 
  X, 
  Check,
  Loader2,
  AlertCircle,
  Calendar,
  Tag,
  ChevronRight,
  Scan
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useApp, type Document } from "@/lib/context"
import { cn } from "@/lib/utils"

type ImportStep = "source" | "upload" | "metadata" | "processing" | "success"

interface FileToUpload {
  name: string
  size: number
  type: string
}

const categories: Array<{ value: Document["category"]; label: string; icon: string }> = [
  { value: "identity", label: "Identité", icon: "id-card" },
  { value: "health", label: "Santé", icon: "heart" },
  { value: "finance", label: "Finance", icon: "wallet" },
  { value: "work", label: "Travail", icon: "briefcase" },
  { value: "housing", label: "Logement", icon: "home" },
  { value: "family", label: "Famille", icon: "users" },
  { value: "legal", label: "Juridique", icon: "scale" },
  { value: "other", label: "Autre", icon: "file" },
]

const maxFileSize = 50 * 1024 * 1024 // 50 MB
const acceptedFormats = [".pdf", ".jpg", ".jpeg", ".png", ".heic", ".docx", ".xlsx"]

export default function ImportPage() {
  const router = useRouter()
  const { addDocument } = useApp()

  const [step, setStep] = useState<ImportStep>("source")
  const [selectedSource, setSelectedSource] = useState<"gallery" | "camera" | "files" | null>(null)
  const [files, setFiles] = useState<FileToUpload[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")

  // Metadata
  const [documentName, setDocumentName] = useState("")
  const [category, setCategory] = useState<Document["category"]>("other")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [expirationDate, setExpirationDate] = useState("")
  const [autoCompress, setAutoCompress] = useState(true)

  const handleSourceSelect = (source: "gallery" | "camera" | "files") => {
    setSelectedSource(source)
    setStep("upload")
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (newFiles: File[]) => {
    setError("")
    const validFiles: FileToUpload[] = []

    for (const file of newFiles) {
      if (file.size > maxFileSize) {
        setError(`Le fichier ${file.name} dépasse la taille maximale de 50 Mo`)
        continue
      }

      const extension = `.${file.name.split(".").pop()?.toLowerCase()}`
      if (!acceptedFormats.includes(extension)) {
        setError(`Format non supporté: ${extension}`)
        continue
      }

      validFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
      })
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
      if (validFiles.length === 1 && !documentName) {
        setDocumentName(validFiles[0].name.replace(/\.[^/.]+$/, ""))
      }
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }

  const handleContinueToMetadata = () => {
    if (files.length === 0) {
      setError("Veuillez sélectionner au moins un fichier")
      return
    }
    setStep("metadata")
  }

  const handleSubmit = async () => {
    if (!documentName.trim()) {
      setError("Veuillez entrer un nom de document")
      return
    }

    setStep("processing")
    setError("")

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setUploadProgress(i)
    }

    // Add document
    const fileType = files[0].name.split(".").pop()?.toLowerCase() as Document["fileType"]
    
    addDocument({
      name: documentName,
      category,
      tags,
      fileType: fileType || "pdf",
      size: files.reduce((acc, f) => acc + f.size, 0),
      expiresAt: expirationDate ? new Date(expirationDate) : undefined,
      isFavorite: false,
    })

    setStep("success")
  }

  const resetForm = () => {
    setStep("source")
    setSelectedSource(null)
    setFiles([])
    setDocumentName("")
    setCategory("other")
    setTags([])
    setExpirationDate("")
    setUploadProgress(0)
    setError("")
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Importer un document</h1>
        <p className="text-muted-foreground">Ajoutez un nouveau document à votre espace sécurisé</p>
      </div>

      {/* Progress steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {["Source", "Fichier", "Informations", "Terminé"].map((label, index) => {
            const stepIndex = ["source", "upload", "metadata", "success"].indexOf(step)
            const isActive = index <= stepIndex
            const isCurrent = index === stepIndex
            return (
              <div key={label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground"
                    )}
                  >
                    {index < stepIndex ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-xs font-medium",
                      isCurrent ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                </div>
                {index < 3 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 flex-1",
                      index < stepIndex ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
          <button onClick={() => setError("")} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step: Source Selection */}
      {step === "source" && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card
            className={cn(
              "cursor-pointer transition-all hover:border-primary hover:shadow-lg",
              selectedSource === "gallery" && "border-primary ring-2 ring-primary"
            )}
            onClick={() => handleSourceSelect("gallery")}
          >
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Galerie</h3>
              <p className="text-sm text-muted-foreground">
                Sélectionnez une image depuis votre galerie photos
              </p>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "cursor-pointer transition-all hover:border-primary hover:shadow-lg",
              selectedSource === "camera" && "border-primary ring-2 ring-primary"
            )}
            onClick={() => handleSourceSelect("camera")}
          >
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <Camera className="h-8 w-8 text-accent" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Scanner</h3>
              <p className="text-sm text-muted-foreground">
                Numérisez un document avec votre appareil photo
              </p>
              <Badge variant="secondary" className="mt-2">
                <Scan className="mr-1 h-3 w-3" />
                Auto-cadrage
              </Badge>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "cursor-pointer transition-all hover:border-primary hover:shadow-lg",
              selectedSource === "files" && "border-primary ring-2 ring-primary"
            )}
            onClick={() => handleSourceSelect("files")}
          >
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <FolderOpen className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Fichiers</h3>
              <p className="text-sm text-muted-foreground">
                Importez un fichier depuis votre appareil
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                PDF, JPG, PNG, DOCX, XLSX
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step: Upload */}
      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Sélectionner les fichiers</CardTitle>
            <CardDescription>
              Formats acceptés: PDF, JPG, PNG, HEIC, DOCX, XLSX (max. 50 Mo)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Drop zone */}
            <div
              className={cn(
                "flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary hover:bg-primary/5"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-center text-lg font-medium">
                Glissez-déposez vos fichiers ici
              </p>
              <p className="mb-4 text-center text-sm text-muted-foreground">ou</p>
              <label>
                <input
                  type="file"
                  multiple
                  accept={acceptedFormats.join(",")}
                  onChange={handleFileInput}
                  className="hidden"
                />
                <Button asChild>
                  <span className="cursor-pointer">Parcourir</span>
                </Button>
              </label>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Fichiers sélectionnés ({files.length})</h4>
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(2)} Mo
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("source")}>
                Retour
              </Button>
              <Button onClick={handleContinueToMetadata} disabled={files.length === 0}>
                Continuer
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Metadata */}
      {step === "metadata" && (
        <Card>
          <CardHeader>
            <CardTitle>Informations du document</CardTitle>
            <CardDescription>
              Ajoutez des informations pour organiser votre document
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom du document *</Label>
              <Input
                id="name"
                value={documentName}
                onChange={e => setDocumentName(e.target.value)}
                placeholder="Ex: Carte d'identité"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Select value={category} onValueChange={value => setCategory(value as Document["category"])}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="Ajouter un tag"
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Expiration date */}
            <div className="space-y-2">
              <Label htmlFor="expiration">Date d'expiration (optionnel)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="expiration"
                  type="date"
                  value={expirationDate}
                  onChange={e => setExpirationDate(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Vous recevrez des rappels avant l'expiration
              </p>
            </div>

            {/* Auto compress */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <Label htmlFor="compress">Compression automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Réduire la taille du fichier tout en conservant la qualité
                </p>
              </div>
              <Switch
                id="compress"
                checked={autoCompress}
                onCheckedChange={setAutoCompress}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Retour
              </Button>
              <Button onClick={handleSubmit}>
                Importer
                <Upload className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Processing */}
      {step === "processing" && (
        <Card className="py-16 text-center">
          <CardContent className="space-y-6">
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
            <div>
              <h3 className="mb-2 text-xl font-semibold">Import en cours...</h3>
              <p className="text-muted-foreground">
                {uploadProgress < 50
                  ? "Téléchargement du fichier..."
                  : uploadProgress < 80
                  ? "Traitement du document..."
                  : "Finalisation..."}
              </p>
            </div>
            <div className="mx-auto max-w-md">
              <Progress value={uploadProgress} className="h-2" />
              <p className="mt-2 text-sm text-muted-foreground">{uploadProgress}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Success */}
      {step === "success" && (
        <Card className="py-16 text-center">
          <CardContent className="space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h3 className="mb-2 text-xl font-semibold">Document importé avec succès !</h3>
              <p className="text-muted-foreground">
                "{documentName}" a été ajouté à votre bibliothèque
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={resetForm}>
                Importer un autre
              </Button>
              <Link href="/library">
                <Button>Voir la bibliothèque</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
