"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Target, Lightbulb } from "lucide-react"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

export function FoundationalStatement() {
  const [cfg, setCfg] = useState<Record<string, any> | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch foundational statement from the dedicated public endpoint
        // Backend returns either { success, data: {...} } or direct object
        const res = await apiFetch<any>("/foundational", { method: "GET", cache: 'no-store' })
        const data = (res && (res as any).data) ? (res as any).data : res
        if (data && typeof data === 'object') {
          setCfg(data)
        }
      } catch {
        // fallback
      }
    }
    load()
  }, [])

  // Normalize values (support string or localized {ar,en})
  const pickText = (v: any, fallback = ''): string => {
    if (!v) return fallback
    if (typeof v === 'string') return v
    if (typeof v === 'object') return v.ar || v.en || fallback
    return fallback
  }

  const title = pickText(cfg?.title) || (
    <>
      في بصمة تصميم، نمنح مشروعك <br />
      <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">حضورًا لا يُنسى</span>
    </>
  )
  const subtitle = pickText(cfg?.subtitle) || "نصمم، نكتب، ونبني لك هوية تترك أثرًا في قلوب عملائك"
  const ctaPrimaryText = pickText(cfg?.ctaPrimaryText) || "اطلب خدمتك الآن"
  const ctaPrimaryLink = cfg?.ctaPrimaryLink || "/order"
  const ctaSecondaryText = pickText(cfg?.ctaSecondaryText) || "تعرف علينا أكثر"
  const ctaSecondaryLink = cfg?.ctaSecondaryLink || "/about"

  return (
    <section className="py-24 bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(139, 92, 246, 0.3) 1px, transparent 0)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="text-center space-y-12 mb-16">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground arabic-text text-balance leading-tight">
                {typeof title === 'string' ? <span dangerouslySetInnerHTML={{ __html: title }} /> : title}
              </h2>

              <p className="text-xl md:text-2xl text-muted-foreground arabic-text max-w-3xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-primary-foreground font-semibold text-lg px-8 py-4 arabic-text group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-primary/25"
              asChild
            >
              <Link href={ctaPrimaryLink} className="flex items-center gap-2">
                {ctaPrimaryText}
                <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="font-semibold arabic-text border-2 border-primary/20 text-foreground hover:bg-primary/10 hover:border-primary/40 bg-card/50 backdrop-blur-sm text-lg px-8 py-4"
              asChild
            >
              <Link href={ctaSecondaryLink}>{ctaSecondaryText}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
