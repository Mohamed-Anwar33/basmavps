"use client"

import { ArrowLeft, Sparkles, Target, Lightbulb, Zap, Crown } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface PageBannerProps {
  title?: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
  variant?: 'services' | 'about' | 'blog' | 'contact' | 'portfolio'
  showCta?: boolean
  // New optional enhancements (backward-compatible)
  features?: string[]
  secondaryCtaText?: string
  secondaryCtaLink?: string
  // Database integration props
  position?: string
  pageSlug?: string
  fallbackTitle?: string
  fallbackSubtitle?: string
}

interface BannerData {
  _id: string
  title?: { ar?: string; en?: string } | string
  subtitle?: { ar?: string; en?: string } | string
  description?: { ar?: string; en?: string } | string
  ctaButton?: {
    text?: { ar?: string; en?: string } | string
    link?: string
    style?: string
  }
  features?: string[]
  isActive: boolean
}

const variantConfig = {
  services: {
    gradient: "from-[#4b2e83] via-[#7a4db3] to-[#4b2e83]",
    icon: Target,
    pattern: 'luxury'
  },
  about: {
    gradient: "from-[#7a4db3] via-[#4b2e83] to-[#7a4db3]",
    icon: Lightbulb,
    pattern: 'geometric'
  },
  blog: {
    gradient: "from-[#4b2e83] via-[#bcbcbc] to-[#7a4db3]",
    icon: Sparkles,
    pattern: 'dots'
  },
  contact: {
    gradient: "from-[#7a4db3] via-[#4b2e83] to-[#bcbcbc]",
    icon: Zap,
    pattern: 'waves'
  },
  portfolio: {
    gradient: "from-[#bcbcbc] via-[#4b2e83] to-[#7a4db3]",
    icon: Crown,
    pattern: 'luxury'
  }
}

const backgroundPatterns = {
  dots: {
    backgroundImage: 'radial-gradient(circle at 3px 3px, rgba(255,255,255,0.2) 1px, transparent 0)',
    backgroundSize: '30px 30px'
  },
  waves: {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    backgroundSize: '60px 60px'
  },
  geometric: {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.08' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/svg%3E")`,
    backgroundSize: '40px 40px'
  },
  luxury: {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2L78 40h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    backgroundSize: '80px 80px'
  }
}

export function PageBanner({ 
  title, 
  subtitle, 
  ctaText = "اكتشف المزيد", 
  ctaLink = "/contact", 
  variant = 'services',
  showCta = true,
  features = [],
  secondaryCtaText,
  secondaryCtaLink,
  position,
  pageSlug,
  fallbackTitle,
  fallbackSubtitle
}: PageBannerProps) {
  const [bannerData, setBannerData] = useState<BannerData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const config = variantConfig[variant]
  const IconComponent = config.icon
  const patternStyle = backgroundPatterns[config.pattern as keyof typeof backgroundPatterns]

  // Fetch banner data from database if position and pageSlug are provided
  useEffect(() => {
    if (position && pageSlug) {
      const fetchBanner = async () => {
        try {
          setIsLoading(true)
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'
          const response = await fetch(`${baseUrl}/banners?position=${position}&pageSlug=${pageSlug}&isActive=true`)
          
          if (response.ok) {
            const result = await response.json()
            if (result.success && result.data && result.data.length > 0) {
              setBannerData(result.data[0])
            }
          }
        } catch (error) {
        } finally {
          setIsLoading(false)
        }
      }

      fetchBanner()
    }
  }, [position, pageSlug])

  // Helper function to extract string from multilingual object
  const getString = (value: any): string => {
    if (typeof value === 'string') return value
    if (value?.ar) return value.ar
    if (value?.en) return value.en
    return ''
  }

  // Use database data if available, otherwise use props
  const displayTitle = bannerData ? getString(bannerData.title) : title || fallbackTitle || ''
  const displaySubtitle = bannerData ? getString(bannerData.subtitle) : subtitle || fallbackSubtitle || ''
  const displayCtaText = bannerData?.ctaButton ? getString(bannerData.ctaButton.text) : ctaText
  const displayCtaLink = bannerData?.ctaButton?.link || ctaLink
  const displayFeatures = bannerData?.features || features
  
  return (
    <section className={`py-4 bg-gradient-to-r ${config.gradient} relative overflow-hidden banner-hover-effect animate-gradient-shift`}>
      {/* Advanced Background Pattern with Animation */}
      <div className="absolute inset-0 opacity-30 animate-morph">
        <div className="absolute inset-0" style={patternStyle}></div>
      </div>
      
      {/* Enhanced noise layer for texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay animate-wave-1"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.4\'/%3E%3C/svg%3E')",
          backgroundSize: '200px 200px',
        }}
      />

      {/* Advanced Floating Elements with Complex Animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Morphing Orbs */}
        <div className="absolute top-10 right-16 w-28 h-28 bg-gradient-to-br from-white/12 to-white/4 rounded-full blur-3xl animate-float-slow shadow-2xl" />
        <div className="absolute bottom-10 left-16 w-20 h-20 bg-gradient-to-br from-white/10 to-white/3 rounded-full blur-2xl animate-float-medium shadow-xl" />
        <div className="absolute top-1/2 left-1/2 w-14 h-14 bg-gradient-to-br from-white/8 to-white/2 rounded-full blur-xl animate-float-fast shadow-lg" />
        
        {/* Animated Particles */}
        <div className="absolute top-1/4 right-1/3 w-3 h-3 bg-white/35 rounded-full animate-particle-1 shadow-lg" />
        <div className="absolute top-3/4 left-1/3 w-2 h-2 bg-white/30 rounded-full animate-particle-2 shadow-md" />
        <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-white/25 rounded-full animate-particle-3 shadow-lg" />
        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-white/40 rounded-full animate-particle-4 shadow-md" />
        
        {/* Additional Floating Elements */}
        <div className="absolute top-16 left-1/4 w-18 h-18 bg-gradient-to-br from-white/6 to-transparent rounded-full blur-2xl animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-16 right-1/4 w-14 h-14 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl animate-float-medium" style={{ animationDelay: '3s' }} />
      </div>

      {/* Enhanced Geometric Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-12 right-32 w-9 h-9 border-2 border-white/18 rotate-45 animate-spin-slow animate-pulse-glow" />
        <div className="absolute bottom-12 left-32 w-7 h-7 border-2 border-white/15 -rotate-12 animate-spin-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/2 w-10 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-horizontal" />
        <div className="absolute bottom-1/3 left-1/3 w-5 h-5 border border-white/20 rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Animated Wave Overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-12">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/6 to-transparent animate-wave-1" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-transparent via-white/4 to-transparent animate-wave-2" />
      </div>

      {/* Sparkle Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-40 w-1 h-1 bg-white animate-sparkle-1 rounded-full" />
        <div className="absolute bottom-20 left-40 w-1 h-1 bg-white animate-sparkle-2 rounded-full" />
        <div className="absolute top-2/3 right-2/3 w-1 h-1 bg-white animate-sparkle-3 rounded-full" />
        <div className="absolute bottom-1/3 left-2/3 w-1 h-1 bg-white animate-sparkle-1 rounded-full" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Icon Section */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-18 h-18 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <IconComponent className="h-9 w-9 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 w-18 h-18 bg-white/5 rounded-2xl animate-pulse" />
              <div className="absolute -inset-2 w-20 h-20 border border-white/10 rounded-3xl animate-spin-slow" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary-foreground arabic-text leading-tight">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent">
                {displayTitle}
              </span>
            </h1>
            
            {displaySubtitle && (
              <p className="text-lg md:text-xl text-primary-foreground/90 arabic-text max-w-xl mx-auto leading-relaxed">
                {displaySubtitle}
              </p>
            )}

            {displayFeatures && displayFeatures.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {displayFeatures.slice(0, 5).map((feat, idx) => (
                  <span
                    key={idx}
                    className="arabic-text text-base px-4 py-2 rounded-full border border-white/20 bg-white/10 text-white/90 backdrop-blur-sm"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            )}

            {showCta && (
              <div className="pt-2 md:pt-3 flex items-center justify-center gap-4 flex-wrap">
                <div className="relative group inline-block">
                  {/* Button Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-white/10 to-white/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                  
                  <Link 
                    href={displayCtaLink}
                    className="relative bg-[#f4f4f6]/10 backdrop-blur-sm text-primary-foreground px-10 py-5 rounded-xl border border-white/20 hover:bg-[#f4f4f6]/20 transition-all duration-300 font-medium text-lg arabic-text inline-flex items-center gap-3 group-hover:scale-105 transform"
                  >
                    {displayCtaText}
                    <ArrowLeft className="h-7 w-7 group-hover:translate-x-1 transition-transform rtl-flip" />
                  </Link>
                </div>

                {secondaryCtaText && secondaryCtaLink && (
                  <Link
                    href={secondaryCtaLink}
                    className="relative bg-[#f4f4f6]/5 backdrop-blur-sm text-white/90 px-10 py-5 rounded-xl border border-white/20 hover:bg-[#f4f4f6]/10 transition-all duration-300 font-medium text-lg arabic-text inline-flex items-center gap-3"
                  >
                    {secondaryCtaText}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
