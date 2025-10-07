import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, Star, Zap, Crown, Gem } from "lucide-react"
import Link from "next/link"

interface LuxuryBannerProps {
  title: string
  subtitle?: string
  ctaText: string
  ctaLink: string
  variant?: 'primary' | 'secondary' | 'accent' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  iconType?: 'sparkles' | 'star' | 'zap' | 'crown' | 'gem'
  backgroundPattern?: 'dots' | 'waves' | 'geometric' | 'luxury'
  // New optional enhancements (backward-compatible)
  features?: string[]
  secondaryCtaText?: string
  secondaryCtaLink?: string
  image?: { src: string; alt?: string }
}

const iconMap = {
  sparkles: Sparkles,
  star: Star,
  zap: Zap,
  crown: Crown,
  gem: Gem
}

export function LuxuryBanner({ 
  title, 
  subtitle, 
  ctaText, 
  ctaLink, 
  variant = 'primary',
  size = 'md',
  showIcon = true,
  iconType = 'sparkles',
  backgroundPattern = 'luxury',
  features = [],
  secondaryCtaText,
  secondaryCtaLink,
  image
}: LuxuryBannerProps) {
  const IconComponent = iconMap[iconType]
  
  const variantStyles = {
    primary: "from-[#4b2e83] via-[#7a4db3] to-[#4b2e83]",
    secondary: "from-[#bcbcbc] via-[#4b2e83] to-[#bcbcbc]",
    accent: "from-[#7a4db3] via-[#4b2e83] to-[#7a4db3]",
    gradient: "from-[#4b2e83] via-[#7a4db3] to-[#4b2e83]"
  }

  const sizeStyles = {
    sm: "py-2",
    md: "py-3",
    lg: "py-4"
  }

  const backgroundPatterns = {
    dots: {
      backgroundImage: 'radial-gradient(circle at 3px 3px, rgba(255,255,255,0.3) 1px, transparent 0)',
      backgroundSize: '40px 40px'
    },
    waves: {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      backgroundSize: '60px 60px'
    },
    geometric: {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/svg%3E")`,
      backgroundSize: '40px 40px'
    },
    luxury: {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2L78 40h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      backgroundSize: '80px 80px'
    }
  }

  return (
    <section className={`${sizeStyles[size]} bg-gradient-to-r ${variantStyles[variant]} relative overflow-hidden banner-hover-effect animate-gradient-shift`}>
      {/* Advanced Background Pattern with Animation */}
      <div className="absolute inset-0 opacity-20 animate-morph">
        <div className="absolute inset-0" style={backgroundPatterns[backgroundPattern]}></div>
      </div>
      
      {/* Enhanced noise layer for texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay animate-wave-1"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.4\'/%3E%3C/svg%3E')",
          backgroundSize: '200px 200px',
        }}
      />

      {/* Advanced Floating Elements with Complex Animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Morphing Orbs */}
        <div className="absolute top-10 right-16 w-32 h-32 bg-gradient-to-br from-white/15 to-white/5 rounded-full blur-3xl animate-float-slow animate-morph shadow-2xl" />
        <div className="absolute bottom-10 left-16 w-24 h-24 bg-gradient-to-br from-white/12 to-white/3 rounded-full blur-2xl animate-float-medium shadow-xl" />
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-white/10 to-white/2 rounded-full blur-xl animate-float-fast shadow-lg" />
        
        {/* Animated Particles */}
        <div className="absolute top-1/4 right-1/3 w-4 h-4 bg-white/40 rounded-full animate-particle-1 shadow-lg" />
        <div className="absolute top-3/4 left-1/3 w-3 h-3 bg-white/35 rounded-full animate-particle-2 shadow-md" />
        <div className="absolute top-1/2 right-1/4 w-5 h-5 bg-white/30 rounded-full animate-particle-3 shadow-lg" />
        <div className="absolute bottom-1/4 left-1/2 w-3 h-3 bg-white/45 rounded-full animate-particle-4 shadow-md" />
        
        {/* Additional Floating Elements */}
        <div className="absolute top-16 left-1/4 w-20 h-20 bg-gradient-to-br from-white/8 to-transparent rounded-full blur-2xl animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-16 right-1/4 w-16 h-16 bg-gradient-to-br from-white/6 to-transparent rounded-full blur-xl animate-float-medium" style={{ animationDelay: '3s' }} />
      </div>

      {/* Enhanced Geometric Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-12 right-32 w-10 h-10 border-2 border-white/20 rotate-45 animate-spin-slow animate-pulse-glow" />
        <div className="absolute bottom-12 left-32 w-8 h-8 border-2 border-white/15 -rotate-12 animate-spin-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/2 w-12 h-2 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-slide-horizontal" />
        <div className="absolute bottom-1/3 left-1/3 w-6 h-6 border border-white/25 rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Animated Wave Overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/8 to-transparent animate-wave-1" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-transparent via-white/5 to-transparent animate-wave-2" />
      </div>

      {/* Sparkle Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-40 w-2 h-2 bg-white animate-sparkle-1 rounded-full" />
        <div className="absolute bottom-20 left-40 w-2 h-2 bg-white animate-sparkle-2 rounded-full" />
        <div className="absolute top-2/3 right-2/3 w-1 h-1 bg-white animate-sparkle-3 rounded-full" />
        <div className="absolute bottom-1/3 left-2/3 w-2 h-2 bg-white animate-sparkle-1 rounded-full" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`grid grid-cols-1 ${image ? 'md:grid-cols-2' : ''} items-center gap-10 md:gap-12`}>
          {/* Content */}
          <div className="space-y-6">
            {showIcon && (
              <div className="flex items-center justify-center md:justify-end gap-3 mb-2">
                <div className="relative">
                  <IconComponent className="h-12 w-12 text-primary-foreground animate-pulse" />
                  <div className="absolute inset-0 h-12 w-12 text-primary-foreground animate-ping opacity-30">
                    <IconComponent className="h-12 w-12" />
                  </div>
                </div>
                <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </div>
            )}
            
            <div className="space-y-4">
              <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary-foreground arabic-text leading-tight text-center md:text-right">
                <span className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                  {title}
                </span>
              </h3>
              
              {subtitle && (
                <p className="text-lg md:text-xl text-primary-foreground/90 arabic-text max-w-xl mx-auto md:mx-0 leading-relaxed text-center md:text-right">
                  {subtitle}
                </p>
              )}

              {features && features.length > 0 && (
                <div className="flex flex-wrap justify-center md:justify-end gap-2 pt-2">
                  {features.slice(0, 5).map((feat, idx) => (
                    <span
                      key={idx}
                      className="arabic-text text-base px-4 py-2 rounded-full border border-white/20 bg-white/10 text-white/90 backdrop-blur-sm"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
              {(() => {
                const isInternal = ctaLink.startsWith("/") || ctaLink.startsWith("#")
                return (
                  <div className="relative group">
                    {/* Button Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-white/10 to-white/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500" />
                    
                    <Button 
                      size="lg" 
                      className="relative bg-gradient-to-r from-[#4b2e83] to-[#7a4db3] backdrop-blur-sm hover:from-[#4b2e83]/90 hover:to-[#7a4db3]/90 font-bold arabic-text group whitespace-nowrap shadow-2xl hover:shadow-[#7a4db3]/30 transition-all duration-500 hover:scale-105 text-lg px-6 py-3 h-auto rounded-lg border border-[#7a4db3]/30 [&>*]:!text-black [&>*>*]:!text-black [&>*>*>*]:!text-black" 
                      asChild
                    >
                      {isInternal ? (
                        <Link href={ctaLink} className="flex items-center gap-3" style={{color: '#000 !important'}}>
                          <span className="relative font-bold" style={{color: '#000 !important'}}>
                            {ctaText}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                          </span>
                          <div className="relative">
                            <ArrowLeft className="h-8 w-8 rtl-flip group-hover:translate-x-2 transition-transform duration-300" style={{color: '#000 !important'}} />
                          </div>
                        </Link>
                      ) : (
                        <a href={ctaLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3" style={{color: '#000 !important'}}>
                          <span className="relative font-bold" style={{color: '#000 !important'}}>
                            {ctaText}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                          </span>
                          <div className="relative">
                            <ArrowLeft className="h-8 w-8 rtl-flip group-hover:translate-x-2 transition-transform duration-300" style={{color: '#000 !important'}} />
                          </div>
                        </a>
                      )}
                    </Button>
                  </div>
                )
              })()}

              {secondaryCtaText && secondaryCtaLink && (
                <Button
                  variant="outline"
                  size="lg"
                  className="arabic-text border-white/25 hover:bg-[#f4f4f6]/10 backdrop-blur-sm h-auto px-8 py-5 bg-[#f4f4f6]/90 [&>*]:!text-black [&>*>*]:!text-black [&>*>*>*]:!text-black"
                  asChild
                >
                  {secondaryCtaLink.startsWith("/") || secondaryCtaLink.startsWith("#") ? (
                    <Link href={secondaryCtaLink} style={{color: '#000 !important'}}>
                      <span style={{color: '#000 !important'}}>{secondaryCtaText}</span>
                    </Link>
                  ) : (
                    <a href={secondaryCtaLink} target="_blank" rel="noopener noreferrer" style={{color: '#000 !important'}}>
                      <span style={{color: '#000 !important'}}>{secondaryCtaText}</span>
                    </a>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Visual column (optional) */}
          {image && (
            <div className="relative mx-auto md:mx-0 w-full max-w-md">
              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-white/10 backdrop-blur-md shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.src} alt={image.alt || ''} className="w-full h-auto object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="absolute -inset-2 rounded-3xl border border-white/10 opacity-50" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
