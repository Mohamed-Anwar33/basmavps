import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"

interface PromoBannerProps {
  headline: string
  description: string
  ctaText: string
  ctaLink: string
}

export function PromoBanner({ headline, description, ctaText, ctaLink }: PromoBannerProps) {
  return (
    <section className="py-3 bg-gradient-to-r from-[#4b2e83] via-[#7a4db3] to-[#4b2e83] relative overflow-hidden banner-hover-effect animate-gradient-shift">
      {/* Advanced Background Pattern with Animation */}
      <div className="absolute inset-0 opacity-20 animate-morph">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 3px 3px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Enhanced noise layer for texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay animate-wave-1"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.4\'/%3E%3C/svg%3E')",
          backgroundSize: '150px 150px',
        }}
      />

      {/* Advanced Floating Elements with Complex Animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Morphing Orbs */}
        <div className="absolute top-8 right-16 w-24 h-24 bg-gradient-to-br from-white/12 to-white/4 rounded-full blur-2xl animate-float-slow shadow-2xl" />
        <div className="absolute bottom-8 left-16 w-18 h-18 bg-gradient-to-br from-white/10 to-white/3 rounded-full blur-xl animate-float-medium shadow-xl" />
        <div className="absolute top-1/2 left-1/2 w-14 h-14 bg-gradient-to-br from-white/8 to-white/2 rounded-full blur-lg animate-float-fast shadow-lg" />
        
        {/* Animated Particles */}
        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-white/35 rounded-full animate-particle-1 shadow-lg" />
        <div className="absolute top-3/4 left-1/3 w-2 h-2 bg-white/30 rounded-full animate-particle-2 shadow-md" />
        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-white/25 rounded-full animate-particle-3 shadow-lg" />
        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-white/40 rounded-full animate-particle-4 shadow-md" />
      </div>

      {/* Enhanced Geometric Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-28 w-6 h-6 border-2 border-white/15 rotate-45 animate-spin-slow animate-pulse-glow" />
        <div className="absolute bottom-10 left-28 w-5 h-5 border border-white/12 -rotate-12 animate-spin-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/2 w-8 h-1 bg-gradient-to-r from-transparent via-white/18 to-transparent animate-slide-horizontal" />
      </div>

      {/* Animated Wave Overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-wave-1" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-transparent via-white/3 to-transparent animate-wave-2" />
      </div>

      {/* Sparkle Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 right-32 w-1 h-1 bg-white animate-sparkle-1 rounded-full" />
        <div className="absolute bottom-16 left-32 w-1 h-1 bg-white animate-sparkle-2 rounded-full" />
        <div className="absolute top-2/3 right-2/3 w-1 h-1 bg-white animate-sparkle-3 rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-right">
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-center md:justify-end gap-2 mb-2">
              <Sparkles className="h-8 w-8 text-primary-foreground animate-pulse" />
              <span className="text-base font-medium text-primary-foreground/80 arabic-text">عرض محدود</span>
            </div>
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground arabic-text leading-tight">{headline}</h3>
            <p className="text-lg text-primary-foreground/90 arabic-text max-w-xl mx-auto md:mx-0">{description}</p>
          </div>

          {(() => {
            const isInternal = ctaLink.startsWith("/") || ctaLink.startsWith("#")
            return (
              <Button 
                size="lg" 
                className="bg-[#f4f4f6] text-[#4b2e83] hover:bg-[#f4f4f6]/90 font-bold arabic-text group whitespace-nowrap shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg px-6 py-3 h-auto" 
                asChild
              >
                {isInternal ? (
                  <Link href={ctaLink} className="flex items-center gap-3">
                    {ctaText}
                    <ArrowLeft className="h-8 w-8 rtl-flip group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <a href={ctaLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                    {ctaText}
                    <ArrowLeft className="h-8 w-8 rtl-flip group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
              </Button>
            )
          })()}
        </div>
      </div>
    </section>
  )
}
