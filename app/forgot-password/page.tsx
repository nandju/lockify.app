"use client"

import { useState } from "react"
import Link from "next/link"
import { Lock, Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

type Step = "email" | "otp" | "reset" | "success"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
    setStep("otp")
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (otp.length !== 6) {
      setError("Veuillez entrer le code complet")
      return
    }

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    setStep("reset")
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères")
      return
    }

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
    setStep("success")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
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
        {step === "email" && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
              <CardDescription>
                Entrez votre adresse email pour recevoir un code de réinitialisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

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

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer le code"
                  )}
                </Button>
              </form>

              <Link
                href="/login"
                className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </CardContent>
          </>
        )}

        {step === "otp" && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Vérification</CardTitle>
              <CardDescription>
                Entrez le code à 6 chiffres envoyé à {email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
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

                <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    "Vérifier"
                  )}
                </Button>
              </form>

              <button
                onClick={() => setStep("email")}
                className="mt-4 flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Modifier l'adresse email
              </button>
            </CardContent>
          </>
        )}

        {step === "reset" && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Nouveau mot de passe</CardTitle>
              <CardDescription>
                Créez un nouveau mot de passe sécurisé
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Votre nouveau mot de passe"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirmez votre mot de passe"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Réinitialisation...
                    </>
                  ) : (
                    "Réinitialiser le mot de passe"
                  )}
                </Button>
              </form>
            </CardContent>
          </>
        )}

        {step === "success" && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Mot de passe réinitialisé</CardTitle>
              <CardDescription>
                Votre mot de passe a été modifié avec succès
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button className="w-full">
                  Se connecter
                </Button>
              </Link>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
