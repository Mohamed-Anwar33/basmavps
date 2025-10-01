"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { PromoBanner } from "@/components/promo-banner"

type Banner = {
  _id: string
  content: { ar: string; en: string } | string
  image?: string
  position?: string
  createdAt: string
}

interface DynamicBannersProps {
  position?: string
  className?: string
}

export function DynamicBanners({ position = "homepage", className = "" }: DynamicBannersProps) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBanners = async () => {
      setLoading(true)
      setError(null)
      try {
        // When lang=ar is passed, backend returns an array with content as string
        const res = await apiFetch<Banner[]>(`/banners?lang=ar`, { method: "GET" })
        const arr = Array.isArray(res) ? res : []
        const filtered = position === "all"
          ? arr
          : arr.filter((banner) =>
              !banner.position ||
              banner.position === position ||
              banner.position.toLowerCase().includes(position.toLowerCase())
            )
        setBanners(filtered)
      } catch (e: any) {
        setError(e?.message || "فشل تحميل البنرات")
        setBanners([])
      } finally {
        setLoading(false)
      }
    }
    loadBanners()
  }, [position])

  if (loading || banners.length === 0) {
    return null
  }

  return (
    <div className={className}>
      {banners.map((banner) => (
        <PromoBanner
          key={banner._id}
          headline={typeof banner.content === 'string' ? banner.content : banner.content.ar}
          description="اكتشف عروضنا الحصرية واحصل على خدمات تصميم احترافية"
          ctaText="تواصل الآن"
          ctaLink="/contact"
        />
      ))}
    </div>
  )
}
