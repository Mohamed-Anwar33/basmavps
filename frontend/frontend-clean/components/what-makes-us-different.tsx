"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { 
  Paintbrush, Award, CheckCircle, Lightbulb, Star, Shield, 
  Clock, Sparkles, Heart, Target, Zap, Gem, Palette, Users,
  Trophy, Rocket, Globe, Settings, Camera, MessageCircle
} from "lucide-react"

type IconName = 'paintbrush' | 'award' | 'check-circle' | 'lightbulb' | 'star' | 'shield' | 
                'clock' | 'sparkles' | 'heart' | 'target' | 'zap' | 'gem' | 'palette' | 'users' | 
                'trophy' | 'rocket' | 'globe' | 'settings' | 'camera' | 'message-circle'

const iconMap: Record<IconName, any> = { 
  paintbrush: Paintbrush, 
  award: Award, 
  'check-circle': CheckCircle, 
  lightbulb: Lightbulb, 
  star: Star, 
  shield: Shield,
  clock: Clock, 
  sparkles: Sparkles, 
  heart: Heart, 
  target: Target, 
  zap: Zap, 
  gem: Gem, 
  palette: Palette, 
  users: Users,
  trophy: Trophy, 
  rocket: Rocket, 
  globe: Globe, 
  settings: Settings, 
  camera: Camera, 
  'message-circle': MessageCircle
}

type Item = { title: string; description: string; iconName?: IconName; iconColor?: string; bgGradient?: string }

export function WhatMakesUsDifferent() {
  const [title, setTitle] = useState<string>("ما يميزنا")
  const [subtitle, setSubtitle] = useState<string>("نقدم خدمات تصميم استثنائية تجمع بين الإبداع والاحترافية")
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        // Load from what-makes-us-different API endpoint
        const res = await apiFetch('/content/homepage-sections/what-makes-us-different', { method: 'GET', cache: 'no-store' }) as any
        if (res?.success) {
          if (res.title) {
            setTitle(res.title)
          }
          if (res.subtitle) {
            setSubtitle(res.subtitle)
          }
          if (res.items && Array.isArray(res.items)) {
            // Ensure all icons are valid, keep new icons as-is, map old ones
            const updatedItems = res.items.map((item: any) => ({
              ...item,
              iconName: iconMap[item.iconName as IconName] ? item.iconName : 
                       item.iconName === 'palette' ? 'paintbrush' :
                       item.iconName === 'shield' ? 'award' :
                       item.iconName === 'clock' ? 'check-circle' :
                       item.iconName === 'sparkles' ? 'lightbulb' :
                       'paintbrush' // Default fallback
            }))
            setItems(updatedItems)
          }
        }
      } catch {
        // fallback to defaults below
      }
    }
    load()
  }, [])

  const fallbackItems: Item[] = [
    { title: 'تصميم يحمل بصمتك', description: 'كل تصميم يُصنع ليعكس هويتك الفريدة ويميزك عن المنافسين', iconName: 'paintbrush', iconColor: 'text-pink-600', bgGradient: 'from-pink-100 to-rose-100' },
    { title: 'شفافية و إحترافية', description: 'سياساتنا واضحة وتعاملنا مبني على الثقة والاحترافية المطلقة', iconName: 'award', iconColor: 'text-emerald-600', bgGradient: 'from-emerald-100 to-teal-100' },
    { title: 'تسليم مدروس', description: 'نلتزم بالوقت المحدد ونضمن جودة عالية في كل مشروع', iconName: 'check-circle', iconColor: 'text-amber-600', bgGradient: 'from-amber-100 to-yellow-100' },
    { title: 'خدمة تُصمم لتُحدث فرقًا', description: 'تجربة إبداعية متكاملة تحول رؤيتك إلى واقع ملموس', iconName: 'lightbulb', iconColor: 'text-indigo-600', bgGradient: 'from-indigo-100 to-violet-100' },
  ]

  const list = (items && items.length > 0 ? items : fallbackItems)

  return (
    <section className="py-24 bg-gradient-to-br from-background via-accent/5 to-primary/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(139, 92, 246, 0.2) 1px, transparent 0)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 right-32 w-40 h-40 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 left-32 w-32 h-32 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-primary/5 rounded-full blur-xl animate-pulse delay-500" />
        
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-6 mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary arabic-text text-balance leading-tight">
            {title}
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground arabic-text max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {list.map((feature, index) => {
            // Force use of fallback icons if iconName is not in our new set
            const validIconName = (feature.iconName && iconMap[feature.iconName as IconName]) ? feature.iconName as IconName : 'lightbulb'
            const Icon = iconMap[validIconName] || Lightbulb
            const iconColor = feature.iconColor || 'text-primary'
            const bgGradient = feature.bgGradient || 'from-primary/10 to-accent/10'
            return (
            <Card
              key={index}
              className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-border/50 bg-card/80 backdrop-blur-sm hover:bg-card hover:border-primary/20"
            >
              <CardContent className="p-8 text-center space-y-6">
                <div className={`w-20 h-20 bg-gradient-to-br ${bgGradient} rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300`}>
                  <Icon className={`h-10 w-10 ${iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground arabic-text group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground arabic-text leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          )})}
        </div>
      </div>
    </section>
  )
}
