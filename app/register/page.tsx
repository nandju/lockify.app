"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Mail, Eye, EyeOff, Loader2, User, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useApp, AppProvider } from "@/lib/context"
import { cn } from "@/lib/utils"

function RegisterContent() {
  const router = useRouter()
  const { login } = useApp()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Password requirements
  const requirements = [
    { label: "Au moins 8 caractères", met: password.length >= 8 },
    { label: "Une lettre majuscule", met: /[A-Z]/.test(password) },
    { label: "Une lettre minuscule", met: /[a-z]/.test(password) },
    { label: "Un chiffre", met: /[0-9]/.test(password) },
    { label: "Un caractère spécial", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ]

  const allRequirementsMet = requirements.every(r => r.met)
  const passwordsMatch = password === confirmPassword && password.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!allRequirementsMet) {
      setError("Le mot de passe ne respecte pas les exigences de sécurité")
      return
    }

    if (!passwordsMatch) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (!acceptTerms) {
      setError("Veuillez accepter les conditions d'utilisation")
      return
    }

    setIsLoading(true)

    try {
      // Simulate account creation
      await new Promise(resolve => setTimeout(resolve, 1500))
      await login(email, password)
      router.push("/dashboard")
    } catch {
      setError("Une erreur est survenue lors de la création du compte")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 py-8">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20 overflow-hidden">
          <img
            src="/logo.png"
            alt="Lockify Logo"
            className="h-24 w-24 object-cover"
          />
        </div>
        <span className="text-2xl font-bold text-foreground">Lockify</span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>
            Rejoignez Lockify pour sécuriser vos documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Jean Dupont"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Créez un mot de passe sécurisé"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password requirements */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {req.met ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className={cn(req.met ? "text-green-500" : "text-muted-foreground")}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirmez votre mot de passe"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={cn(
                    "pl-10",
                    confirmPassword.length > 0 && (passwordsMatch ? "border-green-500" : "border-destructive")
                  )}
                  required
                />
                {confirmPassword.length > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {passwordsMatch ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={checked => setAcceptTerms(checked === true)}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed">
                {"J'accepte les "}
                <Link href="/terms" className="text-primary hover:underline">
                  conditions d'utilisation
                </Link>
                {" et la "}
                <Link href="/privacy" className="text-primary hover:underline">
                  politique de confidentialité
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !allRequirementsMet || !passwordsMatch || !acceptTerms}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <AppProvider>
      <RegisterContent />
    </AppProvider>
  )
}
