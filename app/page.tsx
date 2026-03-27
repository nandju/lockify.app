"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, FileText, Shield, Share2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const slides = [
  {
    icon: FileText,
    title: "Stockez vos documents",
    description: "Conservez tous vos documents importants en toute sécurité dans un seul endroit.",
  },
  {
    icon: Shield,
    title: "Sécurité maximale",
    description: "Vos données sont protégées par un chiffrement de bout en bout.",
  },
  {
    icon: Share2,
    title: "Partagez en toute confiance",
    description: "Partagez vos documents avec un contrôle total sur les accès.",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem("lockify-onboarding")
    const isAuthenticated = localStorage.getItem("lockify-auth")

    if (isAuthenticated === "true") {
      router.push("/dashboard")
      return
    }

    if (hasSeenOnboarding === "true") {
      router.push("/login")
      return
    }

    // Show splash screen
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1)
    } else {
      localStorage.setItem("lockify-onboarding", "true")
      router.push("/login")
    }
  }

  const handleSkip = () => {
    localStorage.setItem("lockify-onboarding", "true")
    router.push("/login")
  }

// Splash Screen 
if (isLoading) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary">
      <div className="animate-pulse">
        <div className="flex items-center gap-3">
          
          {/* 🔽 Logo Image */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20 overflow-hidden">
            <img
              src="/logo.png" // 👉 mets ton image ici (public/logo.png)
              alt="Lockify Logo"
              className="h-24 w-24 object-cover"
            />
          </div>

          {/* 🔽 Texte */}
          <div>
            <h1 className="text-4xl font-bold text-primary-foreground">
              Lockify
            </h1>
            <p className="text-sm text-primary-foreground/80">
              par VOIXE
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

  const CurrentIcon = slides[currentSlide].icon

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Skip button */}
      <div className="flex justify-end p-4">
        <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
          Passer
        </Button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-32">
        {/* Icon */}
        <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-3xl bg-primary/10">
          <CurrentIcon className="h-16 w-16 text-primary" />
        </div>

        {/* Text */}
        <h2 className="mb-4 text-center text-2xl font-bold text-foreground md:text-3xl">
          {slides[currentSlide].title}
        </h2>
        <p className="max-w-md text-center text-muted-foreground">
          {slides[currentSlide].description}
        </p>
      </div>

      {/* Bottom section */}
      <div className="fixed bottom-0 left-0 right-0 bg-background p-6">
        {/* Progress dots */}
        <div className="mb-6 flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted"
              )}
              aria-label={`Aller à la diapositive ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation button */}
        <Button onClick={handleNext} className="w-full gap-2" size="lg">
          {currentSlide === slides.length - 1 ? "Commencer" : "Suivant"}
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
