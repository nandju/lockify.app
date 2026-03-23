"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  FileText, 
  Star, 
  MoreVertical,
  Folder,
  Calendar,
  Tag,
  SortAsc,
  SortDesc,
  ChevronRight,
  X
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  useApp, 
  formatFileSize, 
  formatDate, 
  getCategoryLabel, 
  getCategoryColor,
  type Document 
} from "@/lib/context"
import { cn } from "@/lib/utils"

type ViewMode = "grid" | "list"
type SortField = "name" | "date" | "size" | "category"
type SortOrder = "asc" | "desc"

const categories: Array<{ value: Document["category"] | "all"; label: string }> = [
  { value: "all", label: "Toutes les catégories" },
  { value: "identity", label: "Identité" },
  { value: "health", label: "Santé" },
  { value: "finance", label: "Finance" },
  { value: "work", label: "Travail" },
  { value: "housing", label: "Logement" },
  { value: "family", label: "Famille" },
  { value: "legal", label: "Juridique" },
  { value: "other", label: "Autre" },
]

export default function LibraryPage() {
  const { documents, folders, toggleFavorite, deleteDocument } = useApp()
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Document["category"] | "all">("all")
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [showFilters, setShowFilters] = useState(false)

  const filteredDocuments = useMemo(() => {
    let filtered = [...documents]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        doc =>
          doc.name.toLowerCase().includes(query) ||
          doc.tags.some(tag => tag.toLowerCase().includes(query)) ||
          getCategoryLabel(doc.category).toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(doc => doc.category === selectedCategory)
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "date":
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          break
        case "size":
          comparison = b.size - a.size
          break
        case "category":
          comparison = getCategoryLabel(a.category).localeCompare(getCategoryLabel(b.category))
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [documents, searchQuery, selectedCategory, sortField, sortOrder])

  const hasActiveFilters = searchQuery || selectedCategory !== "all"

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Bibliothèque</h1>
          <p className="text-muted-foreground">{documents.length} documents</p>
        </div>
        <Link href="/import">
          <Button className="gap-2">
            <Plus className="h-5 w-5" />
            Ajouter un document
          </Button>
        </Link>
      </div>

      {/* Folders */}
      <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedFolder(null)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors whitespace-nowrap",
            selectedFolder === null
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card hover:bg-secondary"
          )}
        >
          <Folder className="h-4 w-4" />
          Tous
        </button>
        {folders.map(folder => (
          <button
            key={folder.id}
            onClick={() => setSelectedFolder(folder.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors whitespace-nowrap",
              selectedFolder === folder.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-secondary"
            )}
          >
            <Folder className="h-4 w-4" style={{ color: selectedFolder === folder.id ? "currentColor" : folder.color }} />
            {folder.name}
            <Badge variant="secondary" className="ml-1">{folder.documentCount}</Badge>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher par nom, tag ou catégorie..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn("gap-2", showFilters && "bg-secondary")}
          >
            <Filter className="h-4 w-4" />
            Filtres
            {hasActiveFilters && (
              <Badge className="ml-1 bg-primary text-primary-foreground">
                {(searchQuery ? 1 : 0) + (selectedCategory !== "all" ? 1 : 0)}
              </Badge>
            )}
          </Button>

          {/* View mode */}
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8"
            >
              <Grid className="h-4 w-4" />
              <span className="sr-only">Vue grille</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="h-8 w-8"
            >
              <List className="h-4 w-4" />
              <span className="sr-only">Vue liste</span>
            </Button>
          </div>
        </div>

        {/* Extended filters */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
            <Select
              value={selectedCategory}
              onValueChange={value => setSelectedCategory(value as Document["category"] | "all")}
            >
              <SelectTrigger className="w-[200px]">
                <Tag className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortField}
              onValueChange={value => setSortField(value as SortField)}
            >
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="size">Taille</SelectItem>
                <SelectItem value="category">Catégorie</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
              <span className="sr-only">Ordre de tri</span>
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="gap-2 text-muted-foreground">
                <X className="h-4 w-4" />
                Effacer les filtres
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Documents */}
      {filteredDocuments.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Aucun document trouvé</h3>
            <p className="mb-4 text-muted-foreground">
              {hasActiveFilters
                ? "Essayez de modifier vos filtres"
                : "Commencez par ajouter votre premier document"}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            ) : (
              <Link href="/import">
                <Button className="gap-2">
                  <Plus className="h-5 w-5" />
                  Ajouter un document
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDocuments.map(doc => (
            <Card key={doc.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
              <Link href={`/library/${doc.id}`}>
                <div
                  className="flex h-32 items-center justify-center"
                  style={{ backgroundColor: `${getCategoryColor(doc.category)}15` }}
                >
                  <FileText
                    className="h-16 w-16 transition-transform group-hover:scale-110"
                    style={{ color: getCategoryColor(doc.category) }}
                  />
                </div>
              </Link>
              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <Link href={`/library/${doc.id}`} className="flex-1 min-w-0">
                    <h3 className="truncate font-semibold hover:text-primary">{doc.name}</h3>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/library/${doc.id}`}>Ouvrir</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleFavorite(doc.id)}>
                        {doc.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/sharing?document=${doc.id}`}>Partager</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteDocument(doc.id)}
                      >
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: `${getCategoryColor(doc.category)}20`,
                      color: getCategoryColor(doc.category),
                    }}
                  >
                    {getCategoryLabel(doc.category)}
                  </Badge>
                  <button
                    onClick={() => toggleFavorite(doc.id)}
                    className="p-1"
                    aria-label={doc.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4 transition-colors",
                        doc.isFavorite
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted-foreground hover:text-yellow-500"
                      )}
                    />
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatFileSize(doc.size)} • {formatDate(doc.updatedAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocuments.map(doc => (
            <Card key={doc.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <Link href={`/library/${doc.id}`}>
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg shrink-0"
                    style={{ backgroundColor: `${getCategoryColor(doc.category)}20` }}
                  >
                    <FileText className="h-6 w-6" style={{ color: getCategoryColor(doc.category) }} />
                  </div>
                </Link>
                <Link href={`/library/${doc.id}`} className="flex-1 min-w-0">
                  <h3 className="truncate font-semibold hover:text-primary">{doc.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {getCategoryLabel(doc.category)} • {formatFileSize(doc.size)} • {formatDate(doc.updatedAt)}
                  </p>
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(doc.id)}
                    className="p-2"
                    aria-label={doc.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    <Star
                      className={cn(
                        "h-5 w-5 transition-colors",
                        doc.isFavorite
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted-foreground hover:text-yellow-500"
                      )}
                    />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/library/${doc.id}`}>Ouvrir</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/sharing?document=${doc.id}`}>Partager</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteDocument(doc.id)}
                      >
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Link href={`/library/${doc.id}`}>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
