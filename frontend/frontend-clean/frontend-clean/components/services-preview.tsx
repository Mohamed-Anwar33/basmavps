"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"
import { getArabicText } from "@/lib/text-utils"
import {
  ArrowLeft,
  Clock,
  DollarSign,
  RefreshCw,
  Share2,
  Layout,
  PenTool,
  FileUser,
  Crown,
  Linkedin,
  MessageSquare,
  Settings,
  Star,
  Loader2,
  ImageIcon,
} from "lucide-react"
import Link from "next/link"
import { PriceDisplay } from "@/components/price-display"

type ServiceType = {
  _id: string
  title: { ar: string; en: string }
  description: { ar: string; en: string }
  price: {
    SAR: number
    USD: number
  }
  originalPrice?: {
    SAR: number
    USD: number
  }
  deliveryTime: {
    min: number
    max: number
  }
  deliveryFormats: string[]
  revisions: number
  category: string
  features: { ar: string[]; en: string[] }
  images?: string[]
  mainImages?: {
    _id: string
    url: string
    alt: string
    order: number
    uploadedAt: string
    uploadedBy: string
  }[]
  nonRefundable: boolean
  isActive: boolean
  createdAt: string
  slug?: string
  isFeatured?: boolean
}

// Modern luxury icons mapping for each category
const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, any> = {
    'social-media': Share2,
    'banners': Layout,
    'content': PenTool,
    'resumes': FileUser,
    'logos': Crown,
    'linkedin': Linkedin,
    'consultation': MessageSquare,
    'management': Settings,
  }
  return iconMap[category] || Star
}

// Luxury color schemes for each category
const getCategoryStyle = (category: string) => {
  const styleMap: Record<string, { iconColor: string; bgGradient: string }> = {
    'social-media': {
      iconColor: "text-pink-600",
      bgGradient: "from-pink-100 via-rose-100 to-purple-100"
    },
    'banners': {
      iconColor: "text-violet-600",
      bgGradient: "from-violet-100 via-purple-100 to-indigo-100"
    },
    'content': {
      iconColor: "text-emerald-600",
      bgGradient: "from-emerald-100 via-teal-100 to-cyan-100"
    },
    'resumes': {
      iconColor: "text-amber-600",
      bgGradient: "from-amber-100 via-orange-100 to-yellow-100"
    },
    'logos': {
      iconColor: "text-purple-600",
      bgGradient: "from-purple-100 via-violet-100 to-fuchsia-100"
    },
    'linkedin': {
      iconColor: "text-blue-600",
      bgGradient: "from-blue-100 via-indigo-100 to-sky-100"
    },
    'consultation': {
      iconColor: "text-teal-600",
      bgGradient: "from-teal-100 via-cyan-100 to-blue-100"
    },
    'management': {
      iconColor: "text-slate-600",
      bgGradient: "from-slate-100 via-gray-100 to-zinc-100"
    },
  }
  return styleMap[category] || {
    iconColor: "text-gray-600",
    bgGradient: "from-gray-100 to-slate-100"
  }
}

export function ServicesPreview() {
  const [services, setServices] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        setError(null)
        // نستخدم /services بدون lang للحفاظ على كائنات العناوين {ar,en}
        const response = await apiFetch<{ success: boolean; data: { services: ServiceType[] } }>("/services?limit=50", { method: "GET" })
        
        // التحقق من نوع البيانات
        const data = response?.data?.services || []
        if (!Array.isArray(data)) {
          throw new Error('البيانات المستلمة ليست من النوع المطلوب')
        }
        
        const active = data.filter((s: ServiceType) => s.isActive)
        // اختيار خدمة واحدة من كل فئة لعرض جميع أنواع الخدمات (6 خدمات فقط)
        const seen = new Set<string>()
        const uniqueByCategory: ServiceType[] = []
        for (const svc of active) {
          if (!seen.has(svc.category) && uniqueByCategory.length < 6) {
            uniqueByCategory.push(svc)
            seen.add(svc.category)
          }
        }
        console.log('🎯 Selected 6 services by category:', uniqueByCategory.length, uniqueByCategory.map(s => `${s.category}: ${getArabicText(s.title)}`))
        setServices(uniqueByCategory)
      } catch (e: any) {
        setError(e?.message || "فشل تحميل الخدمات")
        setServices([])
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="arabic-text">جاري تحميل الخدمات...</span>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center text-destructive arabic-text">{error}</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      
      <div className="container mx-auto px-3 sm:px-4 relative">
        <div className="max-w-none mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-foreground mb-4 arabic-text">
              خدماتنا المميزة
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto arabic-text">
              نقدم مجموعة شاملة من الخدمات الإبداعية لتلبية احتياجاتك التسويقية والتصميمية
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {services.map((service) => {
              const IconComponent = getCategoryIcon(service.category)
              const categoryStyle = getCategoryStyle(service.category)
              
              return (
                <Card
                  key={service._id}
                  className="text-card-foreground flex flex-col gap-4 rounded-2xl py-4 group cursor-pointer relative overflow-hidden transition-all duration-500 transform hover:scale-105 shadow-lg bg-white border border-gray-200 hover:border-primary/30 hover:shadow-xl"
                >
                  {/* Service Image - Prioritize mainImages over regular images */}
                  {(() => {
                    // Get the primary cover image - first mainImage or first regular image
                    const coverImage = service.mainImages && service.mainImages.length > 0 
                      ? service.mainImages.sort((a, b) => a.order - b.order)[0]
                      : null;
                    const fallbackImage = service.images && service.images.length > 0 ? service.images[0] : null;
                    const imageUrl = coverImage?.url || fallbackImage;
                    const imageAlt = coverImage?.alt || getArabicText(service.title) || 'صورة الخدمة';
                    
                    return imageUrl ? (
                      <div className="relative w-full h-48 overflow-hidden bg-gray-50">
                        <img
                          src={imageUrl}
                          alt={imageAlt}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        
                        {/* Cover Image Badge */}
                        {coverImage && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                            <ImageIcon className="w-3 h-3 inline mr-1" />
                            غلاف
                          </div>
                        )}
                        
                        {/* Featured Badge */}
                        {service.isFeatured && (
                          <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                            <Star className="w-3 h-3 inline mr-1" />
                            مميزة
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <IconComponent className={`w-16 h-16 ${categoryStyle.iconColor} mx-auto mb-2 opacity-60`} />
                          <p className="text-sm text-gray-500 arabic-text">
                            {service.category === 'social-media' && 'السوشيال ميديا'}
                            {service.category === 'banners' && 'البنرات'}
                            {service.category === 'content' && 'المحتوى'}
                            {service.category === 'resumes' && 'السير الذاتية'}
                            {service.category === 'logos' && 'الشعارات'}
                            {service.category === 'linkedin' && 'لينكد إن'}
                            {service.category === 'consultation' && 'الاستشارات'}
                            {service.category === 'management' && 'الإدارة'}
                          </p>
                        </div>
                        
                        {service.isFeatured && (
                          <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                            <Star className="w-3 h-3 inline mr-1" />
                            مميزة
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="text-lg font-bold arabic-text text-gray-900 mb-1 text-right line-clamp-1">
                          {getArabicText(service.title)}
                        </div>
                        <p className="text-sm text-gray-600 arabic-text leading-relaxed text-right line-clamp-2">
                          {getArabicText(service.description)}
                        </p>
                      </div>
                      <div className={`w-10 h-10 bg-gradient-to-br ${categoryStyle.bgGradient} rounded-xl flex items-center justify-center ml-4 transition-colors`}>
                        <IconComponent className={`h-5 w-5 ${categoryStyle.iconColor}`} />
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs arabic-text">
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span>
                            {service.deliveryTime?.min === 0 && service.deliveryTime?.max === 0 
                              ? 'فوري' 
                              : service.deliveryTime?.min === service.deliveryTime?.max
                              ? `${service.deliveryTime?.min} أيام`
                              : `${service.deliveryTime?.min || 1}-${service.deliveryTime?.max || 3} أيام`
                            }
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
                          <RefreshCw className="h-3 w-3 text-gray-500" />
                          <span>{service.revisions || 2} تعديلات مجانية</span>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-purple-600 text-white px-3 py-1 text-sm font-semibold shadow-sm">
                        <DollarSign className="h-3 w-3 opacity-80" />
                        <span className="arabic-text">
                          <PriceDisplay 
                            price={{
                              amount: service.price.SAR,
                              currency: 'SAR',
                              originalAmount: service.originalPrice?.SAR,
                              originalCurrency: 'SAR'
                            }} 
                            originalClassName="text-white/85 decoration-white/70 decoration-2" 
                          />
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Link
                        href={`/services/${service.slug || service._id}`}
                        className="inline-flex items-center justify-center whitespace-nowrap text-sm transition-all rounded-md gap-1.5 text-primary hover:bg-primary/10 arabic-text group/btn font-medium p-2 h-auto"
                      >
                        عرض التفاصيل
                        <ArrowLeft className="h-3 w-3 rtl-flip group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-8 border border-border/50">
              <h3 className="text-2xl font-bold text-foreground mb-4 arabic-text">
                هل تحتاج خدمة مخصصة؟
              </h3>
              <p className="text-muted-foreground mb-6 arabic-text max-w-2xl mx-auto">
                نحن هنا لمساعدتك في تحقيق رؤيتك الإبداعية. تواصل معنا لمناقشة احتياجاتك الخاصة
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground arabic-text"
                  asChild
                >
                  <Link href="/services">
                    تصفح جميع الخدمات
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="hover:bg-accent hover:text-accent-foreground arabic-text"
                  asChild
                >
                  <Link href="/contact">
                    تواصل معنا
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
