"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  User, 
  Mail, 
  Lock, 
  HardDrive, 
  Crown, 
  ChevronRight,
  Edit,
  Camera,
  Check,
  Download,
  Trash2,
  LogOut,
  Moon,
  Sun,
  Bell,
  Globe,
  Shield
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useApp, formatFileSize } from "@/lib/context"

export default function ProfilePage() {
  const { user, isDarkMode, toggleDarkMode, logout } = useApp()

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  // Edit profile form
  const [editName, setEditName] = useState(user?.name || "")
  const [editEmail, setEditEmail] = useState(user?.email || "")

  // Password form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Preferences
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [language, setLanguage] = useState("fr")

  const storageUsedPercent = user ? (user.storageUsed / user.storageLimit) * 100 : 0

  const handleSaveProfile = () => {
    // Simulate saving
    setIsEditingProfile(false)
  }

  const handleChangePassword = () => {
    // Simulate password change
    setIsChangingPassword(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleExportData = () => {
    // Simulate export
    setShowExportDialog(false)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Mon profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles et préférences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main profile info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Vos informations de compte</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90">
                    <Camera className="h-4 w-4" />
                    <span className="sr-only">Changer la photo</span>
                  </button>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{user?.name}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  {user?.isPremium && (
                    <Badge className="mt-1 gap-1 bg-yellow-500 text-white hover:bg-yellow-600">
                      <Crown className="h-3 w-3" />
                      Premium
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nom complet</p>
                    <p className="font-medium">{user?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Espace de stockage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Utilisé</p>
                <p className="font-medium">
                  {formatFileSize(user?.storageUsed || 0)} / {formatFileSize(user?.storageLimit || 0)}
                </p>
              </div>
              <Progress value={storageUsedPercent} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {(100 - storageUsedPercent).toFixed(1)}% d'espace disponible
              </p>
              
              {!user?.isPremium && (
                <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                  <div className="flex items-center gap-3">
                    <Crown className="h-6 w-6 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">
                        Passez à Premium
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Obtenez 100 Go de stockage et des fonctionnalités exclusives
                      </p>
                    </div>
                  </div>
                  <Button className="mt-3 bg-yellow-600 hover:bg-yellow-700">
                    <Crown className="mr-2 h-4 w-4" />
                    Passer à Premium
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                onClick={() => setIsChangingPassword(true)}
                className="flex w-full items-center justify-between rounded-lg border border-border p-4 text-left transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Mot de passe</p>
                    <p className="text-sm text-muted-foreground">
                      Dernière modification il y a 3 mois
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>

              <Link
                href="/security"
                className="flex w-full items-center justify-between rounded-lg border border-border p-4 text-left transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Paramètres de sécurité</p>
                    <p className="text-sm text-muted-foreground">
                      2FA, biométrie, sessions actives
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Préférences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dark mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Sun className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span>Mode sombre</span>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              </div>

              <Separator />

              {/* Notifications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>Notifications email</span>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span>Notifications push</span>
                  </div>
                  <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>
              </div>

              <Separator />

              {/* Language */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Langue
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setShowExportDialog(true)}
              >
                <Download className="h-4 w-4" />
                Exporter mes données
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setShowLogoutDialog(true)}
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
                Supprimer mon compte
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit profile dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
            <DialogDescription>
              Mettez à jour vos informations personnelles
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom complet</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={e => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveProfile}>
              <Check className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change password dialog */}
      <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <DialogDescription>
              Créez un nouveau mot de passe sécurisé
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mot de passe actuel</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirmer le mot de passe</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
              Annuler
            </Button>
            <Button onClick={handleChangePassword}>
              Changer le mot de passe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export data dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exporter mes données</DialogTitle>
            <DialogDescription>
              Téléchargez une copie de toutes vos données personnelles (RGPD)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Votre export contiendra :
            </p>
            <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
              <li>Vos informations de profil</li>
              <li>La liste de vos documents</li>
              <li>L'historique de vos partages</li>
              <li>Vos préférences</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout confirmation */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Se déconnecter ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous serez déconnecté de votre compte sur cet appareil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={logout}>
              Se déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete account confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer mon compte ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous vos documents et données seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => setShowDeleteDialog(false)}
            >
              Supprimer mon compte
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
