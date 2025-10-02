"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiFetch } from "@/lib/api"
import {
  ArrowLeft,
  Search,
  FileText,
  Linkedin,
  ImageIcon,
  Clock,
  DollarSign,
  RefreshCw,
  Share2,
  Layout,
  FileUser,
  Star,
  TrendingUp,
  Crown,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { PriceDisplay } from "@/components/price-display"
import { ServiceType } from "@/types/service"

// Modern luxury icons mapping for each category - Based on actual database categories
const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, any> = {
    'social-media': Share2,
    'linkedin': Linkedin,
    'banners': Layout,
    'cv-design': FileUser,
    'content-writing': FileText,
    'logo-design': Crown,
    'consultation': Star,
    'management': Star,
    'cv-templates': FileUser,
    'mmmm': Star,
  }
  return iconMap[category] || Star
}

// Luxury color schemes for each category - Based on actual database categories
const getCategoryStyle = (category: string) => {
  const styleMap: Record<string, { iconColor: string; bgGradient: string; borderGradient: string }> = {
    'social-media': {
      iconColor: "text-pink-600",
      bgGradient: "from-pink-50 via-rose-50 to-purple-50",
      borderGradient: "from-pink-200 to-purple-200"
    },
    'linkedin': {
      iconColor: "text-blue-600",
      bgGradient: "from-blue-50 via-indigo-50 to-purple-50",
      borderGradient: "from-blue-200 to-purple-200"
    },
    'banners': {
      iconColor: "text-violet-600",
      bgGradient: "from-violet-50 via-purple-50 to-indigo-50",
      borderGradient: "from-violet-200 to-indigo-200"
    },
    'cv-design': {
      iconColor: "text-amber-600",
      bgGradient: "from-amber-50 via-orange-50 to-yellow-50",
      borderGradient: "from-amber-200 to-orange-200"
    },
    'content-writing': {
      iconColor: "text-emerald-600",
      bgGradient: "from-emerald-50 via-teal-50 to-cyan-50",
      borderGradient: "from-emerald-200 to-cyan-200"
    },
    'logo-design': {
      iconColor: "text-purple-600",
      bgGradient: "from-purple-50 via-violet-50 to-indigo-50",
      borderGradient: "from-purple-200 to-indigo-200"
    },
    'consultation': {
      iconColor: "text-teal-600",
      bgGradient: "from-teal-50 via-cyan-50 to-blue-50",
      borderGradient: "from-teal-200 to-blue-200"
    },
    'management': {
      iconColor: "text-slate-600",
      bgGradient: "from-slate-50 via-gray-50 to-zinc-50",
      borderGradient: "from-slate-200 to-zinc-200"
    },
    'cv-templates': {
      iconColor: "text-orange-600",
      bgGradient: "from-orange-50 via-red-50 to-pink-50",
      borderGradient: "from-orange-200 to-pink-200"
    },
    'mmmm': {
      iconColor: "text-gray-600",
      bgGradient: "from-gray-50 via-slate-50 to-zinc-50",
      borderGradient: "from-gray-200 to-zinc-200"
    },
  }
  return styleMap[category] || {
    iconColor: "text-gray-600",
    bgGradient: "from-gray-50 to-slate-50",
    borderGradient: "from-gray-200 to-slate-200"
  }
}

// Arabic category names mapping - Based on actual database categories (fallback only)
const getCategoryArabicName = (englishKey: string): string => {
  const categoryMap: Record<string, string> = {
    'social-media': 'السوشيال ميديا',
    'linkedin': 'LinkedIn',
    'banners': 'البنرات',
    'cv-design': 'تصميم السير الذاتية',
    'content-writing': 'كتابة المحتوى',
    'logo-design': 'تصميم الشعارات',
    'consultation': 'الاستشارات',
    'management': 'إدارة الحسابات',
    'cv-templates': 'قوالب السير الذاتية',
    'mmmm': 'تجريبي',
  }
  return categoryMap[englishKey] || englishKey
}

// Default categories as fallback - Based on actual database categories
const defaultCategories = [
  { id: "all", name: "جميع الخدمات", icon: Star },
  { id: "social-media", name: "السوشيال ميديا", icon: Share2 },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin },
  { id: "banners", name: "البنرات", icon: Layout },
  { id: "cv-design", name: "تصميم السير الذاتية", icon: FileUser },
  { id: "content-writing", name: "كتابة المحتوى", icon: FileText },
  { id: "logo-design", name: "تصميم الشعارات", icon: Crown },
  { id: "consultation", name: "الاستشارات", icon: Star },
  { id: "management", name: "إدارة الحسابات", icon: Star },
  { id: "cv-templates", name: "قوالب السير الذاتية", icon: FileUser },
]

export function ServicesGrid() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [services, setServices] = useState<ServiceType[]>([])
  const [categories, setCategories] = useState(defaultCategories)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const servicesPerPage = 6 // عرض 6 خدمات في كل صفحة

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch services
        const servicesRes = await apiFetch<{ success: boolean; data: { services: ServiceType[]; pagination?: { total: number; page: number; pages: number; limit: number } } }>("/services?lang=ar&limit=100", { method: "GET" })
        const servicesData = servicesRes?.data?.services || []
        console.log('🧭 Services fetched (count):', servicesData.length)
        if (servicesRes?.data?.pagination) {
        }
        const activeServices = servicesData.filter((s: ServiceType) => s.isActive)
        console.log('✅ Active services (count):', activeServices.length)
        setServices(activeServices)
        
        // Fetch dynamic categories from public endpoint (no auth required)
        try {
          const categoriesRes = await apiFetch<{ success: boolean; data: { categories: Array<{ value: string; label: string }> } }>("/services/categories", { method: "GET" })
          if (categoriesRes?.success && categoriesRes?.data?.categories) {
            const dynamicCategories = [
              { id: "all", name: "جميع الخدمات", icon: Star },
              ...categoriesRes.data.categories.map((cat: { value: string; label: string }) => ({
                id: cat.value,
                name: cat.label, // استخدام label من API مباشرة
                icon: getCategoryIcon(cat.value)
              }))
            ]
            setCategories(dynamicCategories)
          } else {
          }
        } catch (categoriesError) {
          // Keep default categories if API fails
        }
        
      } catch (e: any) {
        setError(e?.message || "فشل تحميل الخدمات")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredServices = services.filter((service: ServiceType) => {
    const titleText = typeof (service as any).title === 'string' ? (service as any).title : (service as any).title?.ar || ''
    const descText = typeof (service as any).description === 'string' ? (service as any).description : (service as any).description?.ar || ''
    const matchesSearch =
      titleText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      descText.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // حساب pagination
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage)
  const startIndex = (currentPage - 1) * servicesPerPage
  const endIndex = startIndex + servicesPerPage
  const currentServices = filteredServices.slice(startIndex, endIndex)

  // إعادة تعيين الصفحة عند تغيير الفلتر أو البحث
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory])

  if (loading) {
    return (
      <section className="py-20 bg-background">
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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center text-destructive arabic-text">
              {error}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Services Count */}
          <div className="text-center mb-6">
            <p className="text-lg text-muted-foreground arabic-text">
              اكتشف <span className="font-bold text-primary">{services.length}</span> خدمة متخصصة
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="ابحث عن خدمة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 arabic-text"
              />
            </div>

            {/* Improved responsive category filter layout */}
            <div className="flex flex-wrap gap-2 justify-center items-center max-w-5xl mx-auto">
              {categories.map((category) => {
                const IconComponent = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className="text-sm flex items-center gap-2 min-w-fit px-3 py-2 h-auto whitespace-nowrap"
                  >
                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                    <span className="arabic-text">{category.name}</span>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Services Grid - محسن للموبايل */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-max items-start">
            {currentServices.map((service) => {
              const IconComponent = getCategoryIcon(service.category)
              const categoryStyle = getCategoryStyle(service.category)
              
              return (
                <Card
                  key={service._id}
                  className="text-card-foreground flex flex-col gap-4 rounded-xl py-4 shadow-sm group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white border border-gray-200 hover:border-primary/30 relative overflow-hidden"
                >
                  {/* Service Image - Prioritize mainImages over regular images */}
                  {(() => {
                    // إعطاء أولوية للصور على Cloudinary أولاً
                    const cloudinaryImage = service.images && service.images.length > 0 
                      ? service.images.find(img => img.includes('cloudinary')) || service.images[0]
                      : null;
                    const mainImage = service.mainImages && service.mainImages.length > 0 
                      ? service.mainImages.sort((a, b) => (a.order || 0) - (b.order || 0))[0]
                      : null;
                    const mainImageUrl = mainImage?.url || null;
                    
                    // أولوية للصور على Cloudinary
                    const imageUrl = cloudinaryImage || mainImageUrl;
                    const imageAlt = mainImage?.alt || service.title?.ar || 'صورة الخدمة';
                    
                    return imageUrl ? (
                      <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-white border-b border-gray-100 rounded-t-lg flex items-center justify-center">
                        <img
                          src={imageUrl}
                          alt={imageAlt}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-2"
                          loading="lazy"
                          onError={(e) => {
                            // عرض placeholder بدلاً من إخفاء الصورة
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const placeholder = target.parentElement?.querySelector('.image-placeholder');
                            if (placeholder) {
                              (placeholder as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                        {/* Placeholder للصور المكسورة */}
                        <div className="image-placeholder absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hidden">
                          <div className="text-center">
                            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 arabic-text">صورة الخدمة</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        
                        {/* Cover Image Badge */}
                        {cloudinaryImage && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                            <ImageIcon className="w-3 h-3 inline mr-1" />
                            محسنة
                          </div>
                        )}
                        
                        {/* Discount Badge */}
                        {(() => {
                          const currentPrice = service.price?.SAR || service.price?.USD || 0;
                          const originalPrice = service.originalPrice?.SAR || service.originalPrice?.USD;
                          const discountPercent = originalPrice && originalPrice > currentPrice 
                            ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
                            : 0;
                          
                          return discountPercent > 0 ? (
                            <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                              <span className="mr-1">🔥</span>
                              خصم {discountPercent}%
                            </div>
                          ) : service.isFeatured ? (
                            <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                              <Star className="w-3 h-3 inline mr-1" />
                              مميزة
                            </div>
                          ) : null;
                        })()}
                      </div>
                    ) : (
                      // Default placeholder when no image - محسن للموبايل
                      <div className="relative w-full h-40 sm:h-48 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 flex items-center justify-center rounded-t-lg">
                        <div className="text-center">
                          <div className={`w-16 h-16 bg-gradient-to-br ${categoryStyle.bgGradient} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm`}>
                            <IconComponent className={`h-8 w-8 ${categoryStyle.iconColor}`} />
                          </div>
                          <p className="text-sm text-gray-600 arabic-text font-medium">
                            {typeof (service as any).title === 'string' ? (service as any).title : (service as any).title?.ar}
                          </p>
                          <p className="text-xs text-gray-400 arabic-text mt-1">صورة قريباً</p>
                        </div>
                        
                        {/* Discount Badge for placeholder */}
                        {(() => {
                          const currentPrice = service.price?.SAR || service.price?.USD || 0;
                          const originalPrice = service.originalPrice?.SAR || service.originalPrice?.USD;
                          const discountPercent = originalPrice && originalPrice > currentPrice 
                            ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
                            : 0;
                          
                          return discountPercent > 0 ? (
                            <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                              <span className="mr-1">🔥</span>
                              خصم {discountPercent}%
                            </div>
                          ) : service.isFeatured ? (
                            <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                              <Star className="w-3 h-3 inline mr-1" />
                              مميزة
                            </div>
                          ) : null;
                        })()}
                      </div>
                    );
                  })()}
                  
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="text-base sm:text-lg font-bold arabic-text text-gray-900 mb-1 text-right line-clamp-1">
                          {typeof (service as any).title === 'string' ? (service as any).title : (service as any).title?.ar}
                        </div>
                        <p className="text-sm text-gray-600 arabic-text leading-relaxed text-right line-clamp-2">
                          {service.uiTexts?.shortDescription || 
                           (typeof (service as any).description === 'string' ? (service as any).description : (service as any).description?.ar)}
                        </p>
                      </div>
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${categoryStyle.bgGradient} rounded-xl flex items-center justify-center ml-3 sm:ml-4 transition-colors`}>
                        <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 ${categoryStyle.iconColor}`} />
                      </div>
                    </div>
                    {/* Meta + Price */}
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
                      <div className="flex flex-col items-end gap-1">
                        {/* نسبة الخصم في منطقة السعر */}
                        {(() => {
                          const currentPrice = service.price?.SAR || service.price?.USD || 0;
                          const originalPrice = service.originalPrice?.SAR || service.originalPrice?.USD;
                          const discountPercent = originalPrice && originalPrice > currentPrice 
                            ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
                            : 0;
                          
                          return discountPercent > 0 ? (
                            <div className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                              <span>🔥</span>
                              <span>وفر {discountPercent}%</span>
                            </div>
                          ) : null;
                        })()}
                        
                        <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-purple-600 text-white px-3 py-1 text-sm font-semibold shadow-sm">
                          <DollarSign className="h-3 w-3 opacity-80" />
                          <span className="arabic-text">
                            <PriceDisplay
                              price={{
                                amount: service.price?.SAR || service.price?.USD || 0,
                                currency: service.price?.SAR ? 'SAR' : 'USD',
                                originalAmount: service.originalPrice?.SAR || service.originalPrice?.USD,
                                originalCurrency: service.originalPrice?.SAR ? 'SAR' : 'USD'
                              }}
                              className="text-white"
                              currentClassName="text-white font-semibold"
                              originalClassName="text-white/80 text-xs"
                            />
                          </span>
                        </div>
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="arabic-text"
              >
                السابق
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="w-10 h-10 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="arabic-text"
              >
                التالي
              </Button>
            </div>
          )}

          {/* Services count info */}
          {filteredServices.length > 0 && (
            <div className="text-center mt-4 text-sm text-muted-foreground arabic-text">
              عرض {startIndex + 1} - {Math.min(endIndex, filteredServices.length)} من {filteredServices.length} خدمة
            </div>
          )}

          {filteredServices.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 arabic-text mb-2">لا توجد خدمات</h3>
              <p className="text-muted-foreground arabic-text mb-4">لم يتم العثور على خدمات تطابق معايير البحث</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                  }}
                  className="arabic-text"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  مسح الفلاتر
                </Button>
                <Button
                  variant="default"
                  onClick={() => window.location.reload()}
                  className="arabic-text"
                >
                  <Loader2 className="w-4 h-4 mr-2" />
                  إعادة تحميل الصفحة
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
