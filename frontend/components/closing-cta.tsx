"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageCircle } from "lucide-react"
import { apiFetch } from "@/lib/api"

interface ClosingCTAData {
  title: { ar: string; en: string }
  subtitle: { ar: string; en: string }
  description: { ar: string; en: string }
  primaryButton: {
    text: { ar: string; en: string }
    link: string
  }
  secondaryButton: {
    text: { ar: string; en: string }
    link: string
  }
  backgroundGradient?: string
}

export function ClosingCTA() {
  const [data, setData] = useState<ClosingCTAData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await apiFetch<{success: boolean, data: any[]}>('/homepage-sections?type=closingCTA&active=true')
        if (response.success && response.data.length > 0) {
          const ctaSection = response.data[0]
          if (ctaSection.closingCTA) {
            setData(ctaSection.closingCTA)
          }
        }
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Fallback data if no data is loaded
  const fallbackData: ClosingCTAData = {
    title: {
      ar: 'اكتشف بصمتك الرقمية مع بصمة تصميم',
      en: 'Discover Your Digital Fingerprint with Basmat Design'
    },
    subtitle: {
      ar: 'خدماتنا تبدأ من الفكرة، وتنتهي بتأثير لا يُنسى',
      en: 'Our services start with an idea and end with an unforgettable impact'
    },
    description: {
      ar: 'ابدأ رحلتك معنا اليوم واحصل على تصميم يعكس هويتك ويحقق أهدافك',
      en: 'Start your journey with us today and get a design that reflects your identity and achieves your goals'
    },
    primaryButton: {
      text: { ar: 'ابدأ مشروعك', en: 'Start Your Project' },
      link: '/services'
    },
    secondaryButton: {
      text: { ar: 'تواصل معنا', en: 'Contact Us' },
      link: '/contact'
    },
    backgroundGradient: 'from-primary/90 to-accent/90'
  }

  const ctaData = data || fallbackData

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-card via-background to-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-200 rounded-lg mx-auto max-w-2xl"></div>
              <div className="h-6 bg-gray-200 rounded mx-auto max-w-lg"></div>
              <div className="h-4 bg-gray-200 rounded mx-auto max-w-md"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`py-16 ${ctaData.backgroundGradient || 'bg-gradient-to-br from-card via-background to-card'} relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-primary/5 rounded-full blur-lg animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary arabic-text text-balance leading-tight">
            {ctaData.title.ar}
            <br />
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">{ctaData.subtitle.ar}</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground arabic-text max-w-2xl mx-auto leading-relaxed">
            {ctaData.description.ar}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary font-semibold text-lg px-8 py-4 arabic-text group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-primary/25 h-auto [&>*]:!text-black [&>*>*]:!text-black [&>*>*>*]:!text-black"
              asChild
            >
              <Link href={ctaData.primaryButton.link} className="flex items-center gap-2" style={{color: '#000 !important'}}>
                <span style={{color: '#000 !important'}}>{ctaData.primaryButton.text.ar}</span>
                <ArrowLeft className="h-5 w-5 rtl-flip group-hover:translate-x-1 transition-transform" style={{color: '#000 !important'}} />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="font-semibold text-lg px-8 py-4 arabic-text border-primary/30 hover:bg-primary/10 hover:border-primary group bg-card/80 backdrop-blur-sm transition-all duration-300 hover:scale-105 h-auto [&>*]:!text-black [&>*>*]:!text-black [&>*>*>*]:!text-black"
              asChild
            >
              <Link href="/contact" className="flex items-center gap-2" style={{color: '#000 !important'}}>
                <MessageCircle className="h-5 w-5" style={{color: '#000 !important'}} />
                <span style={{color: '#000 !important'}}>تواصل معنا</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
