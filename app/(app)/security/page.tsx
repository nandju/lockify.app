"use client"

import { useEffect, useState } from "react"
import { 
  Shield, 
  Smartphone, 
  Fingerprint, 
  Key, 
  Monitor, 
  MapPin, 
  Clock, 
  LogOut,
  Check,
  AlertTriangle,
  ChevronRight,
  QrCode,
  Lock,
  Eye,
  EyeOff
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { formatDate } from "@/lib/context"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"

interface Session {
  id: string
  device: string
  browser: string
  location: string
  ip: string
  lastActive: Date
  isCurrent: boolean
}

interface AccessLog {
  id: string
  action: string
  device: string
  location: string
  timestamp: Date
  success: boolean
}

export default function SecurityPage() {
  const { user, loading } = useAuth()

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [biometricsEnabled, setBiometricsEnabled] = useState(false)
  const [pinEnabled, setPinEnabled] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([])

  const [showSetupTwoFactor, setShowSetupTwoFactor] = useState(false)
  const [showSetupPin, setShowSetupPin] = useState(false)
  const [showRevokeSession, setShowRevokeSession] = useState<string | null>(null)
  const [showRevokeAllSessions, setShowRevokeAllSessions] = useState(false)

  const [otpCode, setOtpCode] = useState("")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null)

  const handleSetupTwoFactor = () => {
    if (otpCode.length === 6) {
      setTwoFactorEnabled(true)
      setShowSetupTwoFactor(false)
      setOtpCode("")
    }
  }

  const handleSetupPin = () => {
    if (pin.length === 4 && pin === confirmPin) {
      setPinEnabled(true)
      setShowSetupPin(false)
      setPin("")
      setConfirmPin("")
    }
  }

  const handleToggleTwoFactor = (enabled: boolean) => {
    if (enabled) {
      setShowSetupTwoFactor(true)
    } else {
      setTwoFactorEnabled(false)
    }
  }

  const handleTogglePin = (enabled: boolean) => {
    if (enabled) {
      setShowSetupPin(true)
    } else {
      setPinEnabled(false)
    }
  }

  useEffect(() => {
    const safeUser = user ?? null
    setTwoFactorEnabled(Boolean((safeUser as { twoFactorEnabled?: boolean } | null)?.twoFactorEnabled))
    setBiometricsEnabled(Boolean((safeUser as { biometricsEnabled?: boolean } | null)?.biometricsEnabled))
    setPinEnabled(Boolean((safeUser as { pinEnabled?: boolean } | null)?.pinEnabled))
  }, [user])

  useEffect(() => {
    if (!user) {
      setSessions([])
      setAccessLogs([])
      setTwoFactorSecret(null)
      return
    }
    setSessions([])
    setAccessLogs([])
    setTwoFactorSecret(null)
  }, [user])

  if (loading) return <p>Loading...</p>

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Sécurité</h1>
        <p className="text-muted-foreground">Protégez votre compte et vos documents</p>
      </div>

      {/* Security score */}
      <Card className="mb-6">
        <CardContent className="flex flex-col items-center p-6 text-center md:flex-row md:text-left">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 md:mb-0 md:mr-6">
            <Shield className="h-10 w-10 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="mb-1 text-xl font-bold text-green-600">Sécurité élevée</h2>
            <p className="text-muted-foreground">
              Votre compte est bien protégé.{" "}
              {!twoFactorEnabled && "Activez l'authentification à deux facteurs pour une protection maximale."}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 md:mt-0">
            {twoFactorEnabled && <Badge className="bg-green-500">2FA activé</Badge>}
            {biometricsEnabled && <Badge className="bg-green-500">Biométrie</Badge>}
            {pinEnabled && <Badge className="bg-green-500">PIN</Badge>}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Authentication methods */}
        <Card>
          <CardHeader>
            <CardTitle>Méthodes d'authentification</CardTitle>
            <CardDescription>Configurez comment vous accédez à votre compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Two-factor authentication */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  twoFactorEnabled ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"
                )}>
                  <Smartphone className={cn("h-5 w-5", twoFactorEnabled ? "text-green-600" : "text-muted-foreground")} />
                </div>
                <div>
                  <p className="font-medium">Authentification à deux facteurs</p>
                  <p className="text-sm text-muted-foreground">
                    Code TOTP via une application
                  </p>
                </div>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={handleToggleTwoFactor}
              />
            </div>

            {/* Biometrics */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  biometricsEnabled ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"
                )}>
                  <Fingerprint className={cn("h-5 w-5", biometricsEnabled ? "text-green-600" : "text-muted-foreground")} />
                </div>
                <div>
                  <p className="font-medium">Biométrie</p>
                  <p className="text-sm text-muted-foreground">
                    Face ID / Empreinte digitale
                  </p>
                </div>
              </div>
              <Switch
                checked={biometricsEnabled}
                onCheckedChange={setBiometricsEnabled}
              />
            </div>

            {/* PIN */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  pinEnabled ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"
                )}>
                  <Key className={cn("h-5 w-5", pinEnabled ? "text-green-600" : "text-muted-foreground")} />
                </div>
                <div>
                  <p className="font-medium">Code PIN</p>
                  <p className="text-sm text-muted-foreground">
                    Code à 4 chiffres
                  </p>
                </div>
              </div>
              <Switch
                checked={pinEnabled}
                onCheckedChange={handleTogglePin}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Sessions actives</CardTitle>
              <CardDescription>Appareils connectés à votre compte</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRevokeAllSessions(true)}
            >
              Tout déconnecter
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucune session active</p>
            ) : (
              sessions.map(session => (
                <div
                  key={session.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-3",
                    session.isCurrent ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Monitor className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{session.device}</p>
                        {session.isCurrent && (
                          <Badge variant="secondary" className="text-xs">Actuel</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{session.browser}</span>
                        <span>•</span>
                        <MapPin className="h-3 w-3" />
                        <span>{session.location}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {session.isCurrent ? "Maintenant" : formatDate(session.lastActive)}
                      </p>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRevokeSession(session.id)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Access history */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Historique des accès</CardTitle>
            <CardDescription>Dernières activités sur votre compte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accessLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucun historique disponible</p>
              ) : (
                accessLogs.map(log => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        log.success ? "bg-green-100 dark:bg-green-900/30" : "bg-destructive/10"
                      )}>
                        {log.success ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className={cn("font-medium", !log.success && "text-destructive")}>
                          {log.action}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{log.device}</span>
                          <span>•</span>
                          <MapPin className="h-3 w-3" />
                          <span>{log.location}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(log.timestamp)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setup 2FA Dialog */}
      <Dialog open={showSetupTwoFactor} onOpenChange={setShowSetupTwoFactor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurer l'authentification à deux facteurs</DialogTitle>
            <DialogDescription>
              Scannez le QR code avec votre application d'authentification
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            {/* QR Code placeholder */}
            <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
              <QrCode className="h-24 w-24 text-muted-foreground" />
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Ou entrez ce code manuellement :
              </p>
              <code className="mt-2 inline-block rounded bg-muted px-4 py-2 font-mono text-sm">
                {twoFactorSecret ?? "Code non disponible"}
              </code>
            </div>

            <div className="w-full space-y-2">
              <Label>Entrez le code de vérification</Label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSetupTwoFactor(false)}>
              Annuler
            </Button>
            <Button onClick={handleSetupTwoFactor} disabled={otpCode.length !== 6}>
              Activer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Setup PIN Dialog */}
      <Dialog open={showSetupPin} onOpenChange={setShowSetupPin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurer le code PIN</DialogTitle>
            <DialogDescription>
              Créez un code PIN à 4 chiffres pour protéger votre compte
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pin">Code PIN</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pin"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
                  className="pl-10 pr-10 text-center text-2xl tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pin">Confirmer le code PIN</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirm-pin"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  className={cn(
                    "pl-10 text-center text-2xl tracking-widest",
                    confirmPin.length === 4 && (pin === confirmPin ? "border-green-500" : "border-destructive")
                  )}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSetupPin(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSetupPin}
              disabled={pin.length !== 4 || pin !== confirmPin}
            >
              Configurer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke session confirmation */}
      <AlertDialog open={!!showRevokeSession} onOpenChange={() => setShowRevokeSession(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Déconnecter cet appareil ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette session sera terminée et l'appareil devra se reconnecter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => setShowRevokeSession(null)}>
              Déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke all sessions confirmation */}
      <AlertDialog open={showRevokeAllSessions} onOpenChange={setShowRevokeAllSessions}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Déconnecter tous les appareils ?</AlertDialogTitle>
            <AlertDialogDescription>
              Toutes les sessions seront terminées sauf celle-ci. Vous devrez vous reconnecter sur les autres appareils.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setShowRevokeAllSessions(false)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Tout déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
