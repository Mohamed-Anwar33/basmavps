"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, Users, Timer, Star, Award, Clock, Heart, Zap, Target, CheckCircle } from "lucide-react"
import { apiFetch } from "@/lib/api"

// Icon mapping for dynamic icons
const iconMap = {
  Briefcase,
  Users,
  Timer,
  Star,
  Award,
  Clock,
  Heart,
  Zap,
  Target,
  CheckCircle
}

type Counter = { label: string; value: number; suffix: string; icon: any; iconColor: string; chipBg: string }

export function CountersSection() {
  const fallback: Counter[] = [
    { label: "مشاريع مكتملة", value: 468, suffix: "+", icon: Briefcase, iconColor: "text-emerald-600", chipBg: "from-emerald-100 to-teal-100" },
    { label: "عملاء راضون", value: 258, suffix: "+", icon: Users, iconColor: "text-indigo-600", chipBg: "from-indigo-100 to-blue-100" },
    { label: "سنوات خبرة", value: 6, suffix: "+", icon: Timer, iconColor: "text-amber-600", chipBg: "from-amber-100 to-yellow-100" },
    { label: "تقييم العملاء", value: 4.9, suffix: "/5", icon: Star, iconColor: "text-rose-600", chipBg: "from-rose-100 to-pink-100" },
  ]
  const [counters, setCounters] = useState<Counter[]>(fallback)
  const [isVisible, setIsVisible] = useState(false)
  const [animatedValues, setAnimatedValues] = useState(fallback.map(() => 0))
  const [isMounted, setIsMounted] = useState(false)
  const [title, setTitle] = useState('أرقامنا')
  const [subtitle, setSubtitle] = useState('أرقامنا تتحدث عن التزامنا، إبداعنا، وشراكتنا مع كل عميل')

  // Load counters from admin content API
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch<any>('/content/homepage-sections/counters', { method: 'GET', cache: 'no-store' })
        if (res?.items && Array.isArray(res.items)) {
          const dynamicCounters: Counter[] = res.items.map((item: any) => ({
            label: item.label || '',
            value: item.value || 0,
            suffix: item.suffix || '+',
            icon: iconMap[item.iconName as keyof typeof iconMap] || Briefcase,
            iconColor: item.iconColor || 'text-emerald-600',
            chipBg: item.chipBg || 'from-emerald-100 to-teal-100'
          }))
          setCounters(dynamicCounters)
          setAnimatedValues(dynamicCounters.map(() => 0))
        }
        
        // Update title and subtitle from API response
        if (res?.title) {
          setTitle(res.title)
        }
        if (res?.subtitle) {
          setSubtitle(res.subtitle)
        }
      } catch {
        // keep fallback
      }
    }
    load()
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 },
    )

    const element = document.getElementById("counters-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [isMounted])

  useEffect(() => {
    if (isVisible) {
      counters.forEach((counter, index) => {
        const duration = 2000
        const steps = 60
        const increment = counter.value / steps
        let current = 0

        const timer = setInterval(() => {
          current += increment
          if (current >= counter.value) {
            current = counter.value
            clearInterval(timer)
          }

          setAnimatedValues((prev) => {
            const newValues = [...prev]
            newValues[index] = current
            return newValues
          })
        }, duration / steps)
      })
    }
  }, [isVisible])

  return (
    <section id="counters-section" className="py-24 bg-gradient-to-br from-background via-accent/5 to-primary/5 relative overflow-hidden">
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
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary arabic-text text-balance leading-tight">{title}</h2>
          <p className="text-lg md:text-xl text-muted-foreground arabic-text max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {counters.map((counter, index) => (
            <Card
              key={index}
              className="text-center bg-white/70 dark:bg-card/80 backdrop-blur-md border border-transparent hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-7 space-y-4 relative">
                <div className={`mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br ${counter.chipBg} flex items-center justify-center mb-1 shadow-sm`}>
                  <counter.icon className={`h-6 w-6 ${counter.iconColor}`} />
                </div>
                <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  {!isMounted ? (
                    counter.suffix === "/5" ? counter.value.toFixed(1) : counter.value
                  ) : (
                    counter.suffix === "/5" ? animatedValues[index].toFixed(1) : Math.floor(animatedValues[index])
                  )}
                  <span className="mr-1 align-super text-xl text-accent" dir="ltr">{counter.suffix}</span>
                </div>
                <p className="text-sm text-muted-foreground arabic-text font-semibold tracking-wide group-hover:text-primary transition-colors">{counter.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
