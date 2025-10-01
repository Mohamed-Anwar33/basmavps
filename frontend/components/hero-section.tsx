"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Palette, Users, Zap, Award } from "lucide-react"
import { apiFetch } from "@/lib/api"

type Localized = { ar: string; en: string }
type HeroData = {
  title?: Localized
  subtitle?: Localized
  description?: Localized
  ctaButton?: { text?: Localized; link?: string; style?: string }
  backgroundImage?: string
  backgroundVideo?: string
  backgroundColor?: string
  textColor?: string
  overlayOpacity?: number
  animation?: string
  isActive?: boolean
}

export function HeroSection() {
  const [hero, setHero] = useState<HeroData | null>(null)

  useEffect(() => {
    const loadHero = async () => {
      try {
        const res = await apiFetch<HeroData>("/hero-section", { method: "GET", cache: 'no-store' })
        setHero(res)
      } catch {
        // fallback silently
      }
    }
    loadHero()
  }, [])

  const title = hero?.title?.ar || "صمّم بصمتك الخاصة."
  const subtitle = hero?.subtitle?.ar || "ابدأ رحلتك نحو هوية رقمية لا تُنسى."
  const description = hero?.description?.ar || "في بصمة تصميم، نحول أفكارك إلى تصاميم استثنائية تعكس شخصيتك وتحقق أهدافك"
  const ctaText = hero?.ctaButton?.text?.ar || "تواصل معنا"
  const ctaLink = hero?.ctaButton?.link || "/contact"

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-primary/20 to-accent/20">
      {/* Hero section now works with fixed transparent navbar */}

      {/* Dot Pattern Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-accent/15 to-primary/15 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-primary/10 rounded-full blur-xl animate-pulse delay-500" />
        
      </div>

      {/* Hero Content */}
      <div className="flex-1 flex items-center justify-center pt-32 md:pt-36 lg:pt-40 pb-10">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content - Right side for RTL */}
            <div className="order-2 lg:order-1 text-center lg:text-right space-y-8 animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground arabic-text text-balance leading-tight">
                {title} <span className="text-primary">{subtitle}</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground arabic-text max-w-2xl mx-auto lg:mx-0">
                {description}
              </p>


              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-primary-foreground font-semibold text-lg px-8 py-4 arabic-text group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-primary/25"
                  asChild
                >
                  <Link href="/services" className="flex items-center gap-2">
                    اطلب خدمة
                    <ArrowLeft className="h-5 w-5 rtl-flip group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-lg px-8 py-4 arabic-text group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-primary/25"
                  asChild
                >
                  <Link href={ctaLink} className="flex items-center gap-2">
                    {ctaText}
                    <ArrowLeft className="h-5 w-5 rtl-flip group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Hero Visual - Left side for RTL */}
            <div className="order-1 lg:order-2 flex justify-center animate-slide-up">
              <div className="relative">
                {/* Lottie Animation without frame */}
                <div className="w-[22rem] h-[22rem] md:w-[34rem] md:h-[28rem]">
                  <DotLottieReact
                    src="https://lottie.host/5ed0e394-6dd1-48d5-99bd-4815a9806c7f/56YFKPR8kb.lottie"
                    loop
                    autoplay
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>

                {/* Animated Floating Benefit Cards around the image */}
                <div className="absolute -top-6 -right-6 bg-card/90 backdrop-blur-sm border border-border rounded-xl p-2 text-center hover:bg-card transition-all duration-300 hover:scale-110 shadow-lg animate-bounce">
                  <Award className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-foreground text-xs font-semibold arabic-text">جودة عالية</p>
                </div>
                <div className="hidden md:block absolute -top-6 -left-6 bg-card/90 backdrop-blur-sm border border-border rounded-xl p-2 text-center hover:bg-card transition-all duration-300 hover:scale-110 shadow-lg animate-bounce delay-500">
                  <Users className="h-5 w-5 text-accent mx-auto mb-1" />
                  <p className="text-foreground text-xs font-semibold arabic-text">فريق محترف</p>
                </div>
                <div className="hidden md:block absolute -bottom-6 -right-6 bg-card/90 backdrop-blur-sm border border-border rounded-xl p-2 text-center hover:bg-card transition-all duration-300 hover:scale-110 shadow-lg animate-bounce delay-1000">
                  <Palette className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-foreground text-xs font-semibold arabic-text">إبداع متميز</p>
                </div>
                <div className="hidden md:block absolute -bottom-6 -left-6 bg-card/90 backdrop-blur-sm border border-border rounded-xl p-2 text-center hover:bg-card transition-all duration-300 hover:scale-110 shadow-lg animate-bounce delay-1500">
                  <Zap className="h-5 w-5 text-accent mx-auto mb-1" />
                  <p className="text-foreground text-xs font-semibold arabic-text">تسليم سريع</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Luxury Geometric Bottom Section */}
      <div className="absolute bottom-0 left-0 w-full h-32 md:h-40 overflow-hidden">
        {/* Elegant Diagonal Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent"></div>
        
        {/* Sophisticated Geometric Pattern */}
        <div className="absolute bottom-0 w-full h-full">
          {/* Diamond Pattern Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 35%, rgba(139, 92, 246, 0.3) 35%, rgba(139, 92, 246, 0.3) 65%, transparent 65%),
                linear-gradient(-45deg, transparent 35%, rgba(168, 85, 247, 0.2) 35%, rgba(168, 85, 247, 0.2) 65%, transparent 65%)
              `,
              backgroundSize: '40px 40px',
              backgroundPosition: '0 0, 20px 20px'
            }}></div>
          </div>

          {/* Floating Luxury Elements */}
          <div className="absolute bottom-4 left-1/4 w-3 h-3 bg-gradient-to-br from-primary to-accent rounded-full animate-pulse opacity-60"></div>
          <div className="absolute bottom-8 left-1/3 w-2 h-2 bg-accent rounded-full animate-pulse delay-500 opacity-40"></div>
          <div className="absolute bottom-6 right-1/4 w-4 h-4 bg-gradient-to-br from-accent to-primary rounded-full animate-pulse delay-1000 opacity-50"></div>
          <div className="absolute bottom-10 right-1/3 w-2 h-2 bg-primary rounded-full animate-pulse delay-1500 opacity-30"></div>
          <div className="absolute bottom-12 left-1/2 w-3 h-3 bg-gradient-to-br from-primary/50 to-accent/50 rounded-full animate-pulse delay-2000 opacity-40"></div>

          {/* Elegant Hexagonal Elements */}
          <div className="absolute bottom-6 left-1/6 w-6 h-6 rotate-45 bg-gradient-to-br from-primary/20 to-accent/20 animate-spin-slow opacity-60"></div>
          <div className="absolute bottom-8 right-1/6 w-4 h-4 rotate-45 bg-gradient-to-br from-accent/15 to-primary/15 animate-spin-slow delay-1000 opacity-40"></div>

          {/* Premium Glow Effects */}
          <div className="absolute bottom-0 left-1/4 w-32 h-16 bg-gradient-to-t from-primary/10 to-transparent blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-40 h-20 bg-gradient-to-t from-accent/8 to-transparent blur-2xl animate-pulse delay-1000"></div>
          
          {/* Sophisticated Border Line */}
          <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        </div>
      </div>
    </section>
  )
}
