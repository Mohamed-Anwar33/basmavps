"use client"

import { useEffect, useState } from "react"
import { LuxuryBanner } from "@/components/luxury-banner"
import { apiFetch } from "@/lib/api"

// Generic settings-driven banner wrapper.
// Reads settings by category and maps keys to LuxuryBanner props.
// Expected keys: title, subtitle, ctaText, ctaLink, variant, size, iconType, backgroundPattern, features, secondaryCtaText, secondaryCtaLink, image

export function SettingsBanner({ category }: { category: string }) {
  const [cfg, setCfg] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await apiFetch<Array<{ key: string; value: any; category?: string }>>(`/settings?category=${encodeURIComponent(category)}`, { method: "GET" })
        if (Array.isArray(res)) {
          const map: Record<string, any> = {}
          res.forEach(s => { map[s.key] = s.value })
          setCfg(map)
        } else {
          setCfg(null)
        }
      } catch {
        setCfg(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [category])

  if (loading) return null

  const title = cfg?.title || "لا تكتفي بالظهور… كن علامة"
  const subtitle = cfg?.subtitle || undefined
  const ctaText = cfg?.ctaText || "اطلب الآن وابدأ التأثير"
  const ctaLink = cfg?.ctaLink || "/contact"
  const variant = (cfg?.variant as any) || "primary"
  const size = (cfg?.size as any) || "md"
  const iconType = (cfg?.iconType as any) || "sparkles"
  const backgroundPattern = (cfg?.backgroundPattern as any) || "luxury"
  const features = Array.isArray(cfg?.features) ? cfg?.features : []
  const secondaryCtaText = cfg?.secondaryCtaText
  const secondaryCtaLink = cfg?.secondaryCtaLink
  const image = cfg?.image && typeof cfg.image === 'object' ? cfg.image : undefined

  return (
    <LuxuryBanner
      title={title}
      subtitle={subtitle}
      ctaText={ctaText}
      ctaLink={ctaLink}
      variant={variant}
      size={size}
      iconType={iconType}
      backgroundPattern={backgroundPattern}
      features={features}
      secondaryCtaText={secondaryCtaText}
      secondaryCtaLink={secondaryCtaLink}
      image={image}
    />
  )
}
