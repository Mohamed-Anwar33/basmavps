'use client'

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { Share2, Layout, PenTool, FileUser, Crown, Linkedin, MessageSquare, Settings, Star, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { ServiceFeaturesTimeline } from "@/components/service-details"
import { useEffect, useState } from 'react'
import { ServiceType } from "@/types/service"
import { useCurrency } from "@/contexts/currency-context"

// WhatsApp Contact Button Component
function WhatsAppContactButton() {
  const [whatsappLink, setWhatsappLink] = useState<string>('')

  useEffect(() => {
    const loadWhatsAppSettings = async () => {
      try {
        const res = await apiFetch('/contact-page', { method: 'GET' }) as any
        
        if (res?.success && res.data) {
          const d = res.data
          let link = ''
          
          // Check if API returns flat structure
          if (d.whatsappLink) {
            link = (d.whatsappLink ?? '').toString().trim()
          } else if (d.contactInfo?.whatsappLink) {
            // Check nested structure
            link = (d.contactInfo?.whatsappLink ?? '').toString().trim()
          }
          
          const isValidWhats = (url: string) => {
            if (!url) return false
            const u = String(url).trim()
            if (!u || u === '#') return false
            if (u.toLowerCase().includes('your-number')) return false
            return true
          }
          
          if (isValidWhats(link)) {
            setWhatsappLink(link)
          }
        }
      } catch (error) {
      }
    }
    
    loadWhatsAppSettings()
  }, [])

  if (!whatsappLink) {
    return (
      <a 
        href="/contact"
        className="block w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20BA5A] hover:to-[#0E7A6E] text-white py-3 px-6 rounded-xl font-bold arabic-text text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
      >
        <span className="flex items-center justify-center gap-2 text-white font-extrabold text-base">
          <span className="drop-shadow-sm">تواصل معنا</span>
          <span className="opacity-75 group-hover:opacity-100 transition-opacity text-xl">💬</span>
        </span>
      </a>
    )
  }

  return (
    <a 
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20BA5A] hover:to-[#0E7A6E] text-white py-3 px-6 rounded-xl font-bold arabic-text text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
    >
      <span className="flex items-center justify-center gap-2 text-white font-extrabold text-base">
        <span className="drop-shadow-sm">تواصل واتساب</span>
        <span className="opacity-75 group-hover:opacity-100 transition-opacity text-xl">💬</span>
      </span>
    </a>
  )
}

// Map category to icon
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

// Optional: styles if needed later
const getCategoryStyle = (category: string) => {
  const styleMap: Record<string, { iconColor: string; bgGradient: string }> = {
    'social-media': { iconColor: "text-pink-600", bgGradient: "from-pink-50 via-rose-50 to-purple-50" },
    'banners': { iconColor: "text-violet-600", bgGradient: "from-violet-50 via-purple-50 to-indigo-50" },
    'content': { iconColor: "text-emerald-600", bgGradient: "from-emerald-50 via-teal-50 to-cyan-50" },
    'resumes': { iconColor: "text-amber-600", bgGradient: "from-amber-50 via-orange-50 to-yellow-50" },
    'logos': { iconColor: "text-purple-600", bgGradient: "from-purple-50 via-violet-50 to-fuchsia-50" },
    'linkedin': { iconColor: "text-blue-600", bgGradient: "from-blue-50 via-indigo-50 to-sky-50" },
    'consultation': { iconColor: "text-teal-600", bgGradient: "from-teal-50 via-cyan-50 to-blue-50" },
    'management': { iconColor: "text-slate-600", bgGradient: "from-slate-50 via-gray-50 to-zinc-50" },
  }
  return styleMap[category] || { iconColor: "text-gray-600", bgGradient: "from-gray-50 to-slate-50" }
}

export default function ServiceDetailPage({
  params,
}: {
  params: { serviceId: string }
}) {
  const [service, setService] = useState<ServiceType | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null)
  const { currency, convert, format } = useCurrency()
  
  useEffect(() => {
    async function fetchService() {
      try {
        const response = await apiFetch<{ success: boolean; data: { service: ServiceType } }>(`/services/${params.serviceId}`)
        
        // Handle both direct service object and wrapped response
        const serviceData = response?.data?.service || response
        setService(serviceData as ServiceType)
      } catch (error) {
        setService(null)
      } finally {
        setLoading(false)
      }
    }
    
    fetchService()
  }, [params.serviceId])

  // إعادة تحديث المكون عند تغيير العملة
  useEffect(() => {
    // فقط لإجبار إعادة الرندر عند تغيير العملة
  }, [currency])

  // إضافة دعم لوحة المفاتيح للـ lightbox
  useEffect(() => {
    if (!selectedGalleryImage || !service) return

    const portfolioImages = ((service as any)?.portfolioImages || [])
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    
    if (portfolioImages.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = portfolioImages.findIndex((img: any) => 
        (img.url || img) === selectedGalleryImage
      )

      switch (e.key) {
        case 'Escape':
          setSelectedGalleryImage(null)
          break
        case 'ArrowLeft':
          e.preventDefault()
          const prevIndex = currentIndex === 0 ? portfolioImages.length - 1 : currentIndex - 1
          setSelectedGalleryImage(portfolioImages[prevIndex].url || portfolioImages[prevIndex])
          break
        case 'ArrowRight':
          e.preventDefault()
          const nextIndex = currentIndex === portfolioImages.length - 1 ? 0 : currentIndex + 1
          setSelectedGalleryImage(portfolioImages[nextIndex].url || portfolioImages[nextIndex])
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedGalleryImage, service])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f4f6] via-white to-[#bcbcbc]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4b2e83] mx-auto mb-4"></div>
          <p className="text-[#4b2e83] arabic-text">جاري التحميل...</p>
        </div>
      </div>
    )
  }
  
  // Ensure service is non-null for TypeScript narrowing
  if (!service) {
    return notFound()
  }

  // Normalize common fields to support different shapes
  const sAny: any = service
  const titleAr: string = typeof sAny?.title === 'string' ? sAny.title : (sAny?.title?.ar || sAny?.title?.en || '')
  const descriptionAr: string = typeof sAny?.description === 'string' ? sAny.description : (sAny?.description?.ar || sAny?.description?.en || '')
  // تحويل السعر للعملة المختارة
  const getConvertedPrice = () => {
    const p = sAny?.price
    let baseAmount = 0
    let baseCurrency: 'SAR' | 'USD' = 'SAR'
    
    // استخراج السعر الأساسي
    if (p?.amount) {
      baseAmount = p.amount
      baseCurrency = p.currency || 'SAR'
    } else if (typeof p?.SAR === 'number') {
      baseAmount = p.SAR
      baseCurrency = 'SAR'
    } else if (typeof p?.USD === 'number') {
      baseAmount = p.USD
      baseCurrency = 'USD'
    }
    
    // تحويل السعر للعملة المختارة
    const convertedAmount = convert(baseAmount, baseCurrency, currency)
    
    // السعر الأصلي إذا كان موجود
    let originalAmount = null
    if (sAny?.originalPrice?.SAR && baseCurrency === 'SAR') {
      originalAmount = convert(sAny.originalPrice.SAR, 'SAR', currency)
    } else if (sAny?.originalPrice?.USD && baseCurrency === 'USD') {
      originalAmount = convert(sAny.originalPrice.USD, 'USD', currency)
    }
    
    return {
      amount: convertedAmount,
      currency,
      originalAmount,
      baseAmount,
      baseCurrency
    }
  }
  
  const normalizedPrice = getConvertedPrice()
  const normalizedDeliveryTime = (() => {
    // Check if deliveryTime exists and has valid min/max values
    if (sAny?.deliveryTime && 
        typeof sAny.deliveryTime === 'object' && 
        typeof sAny.deliveryTime.min === 'number' && 
        typeof sAny.deliveryTime.max === 'number') {
      return sAny.deliveryTime
    }
    // Fallback to durationDays if deliveryTime is not available
    if (typeof sAny?.durationDays === 'number') {
      return { min: sAny.durationDays, max: sAny.durationDays }
    }
    // Default fallback
    return { min: 1, max: 4 }
  })()
  const normalizedFeatures: string[] = Array.isArray(sAny?.features)
    ? sAny.features
    : Array.isArray(sAny?.features?.ar)
      ? sAny.features.ar
      : []
  const normalizedRevisions: number = typeof sAny?.revisions === 'number' ? sAny.revisions : 2
  const normalizedFormats: string[] = Array.isArray(sAny?.deliveryFormats) ? sAny.deliveryFormats : []
  const normalizedServiceId: string = service.slug || service._id
  const shortDescription = descriptionAr.length > 150 
    ? descriptionAr.substring(0, 150).trim() + '...'
    : descriptionAr

  const IconComponent = getCategoryIcon(service.category)
  const categoryStyle = getCategoryStyle(service.category)

  // UI Texts overrides (Arabic)
  const ui = service.uiTexts
  const tQualityTitle = ui?.qualityTitle?.ar || 'جودة احترافية'
  const tQualitySubtitle = ui?.qualitySubtitle?.ar || 'بصمة إبداعية مميزة'
  const tDetailsTitle = typeof ui?.detailsTitle === 'string' 
    ? ui.detailsTitle 
    : ui?.detailsTitle?.ar || 'تفاصيل الخدمة'
  const tDetailsLines = ui?.details?.ar ? ui.details.ar.split('\n').filter(Boolean) : null
  
  // استخدام وصف الخدمة كنقاط تفاصيل إذا لم تكن هناك نقاط مخصصة
  const serviceDescriptionLines = descriptionAr ? descriptionAr.split('\n').filter(Boolean) : []
  
  // الحقول الجديدة من لوحة التحكم
  const shortDescriptionFromAdmin = ui?.shortDescription || ''
  const workStepsFromAdmin = ui?.workSteps || []

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-24">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
              <Link href="/" className="hover:text-[#4b2e83] arabic-text transition-colors">الرئيسية</Link>
              <span>/</span>
              <Link href="/services" className="hover:text-[#4b2e83] arabic-text transition-colors">الخدمات</Link>
              <span>/</span>
              <span className="text-[#4b2e83] arabic-text">{titleAr}</span>
            </div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-start gap-6 mb-4">
                  {(() => {
                    // استخدام الصور من الداتابيس
                    const serviceImages = sAny?.images || []
                    
                    // إذا لم توجد صور في الداتابيس، استخدم صورة افتراضية
                    const fallbackImage = (() => {
                      const imageMap: Record<string, string> = {
                        'social-media': '/تفاصي الخدمات/سوشيال ميديا.png',
                        'logos': '/تفاصي الخدمات/الشعارات.png',
                        'banners': '/تفاصي الخدمات/تصميم البنرات.png',
                        'resumes': '/تفاصي الخدمات/السير الذاتية.png',
                        'linkedin': '/تفاصي الخدمات/حسابات لينكد ان.png',
                        'content': '/تفاصي الخدمات/كتابة المحتوي التسويقي.png'
                      }
                      return imageMap[service.category] || '/تفاصي الخدمات/سوشيال ميديا.png'
                    })()
                    
                    const displayImages = serviceImages.length > 0 ? serviceImages : [fallbackImage]
                    const currentImage = displayImages[currentImageIndex] || fallbackImage
                    
                    return (
                      <div className="flex-shrink-0 relative">
                        <div className="relative">
                          <img 
                            src={currentImage}
                            alt={titleAr}
                            className="w-32 h-32 md:w-40 md:h-40 object-contain transition-all duration-300"
                            onError={(e) => {
                              // في حالة عدم وجود الصورة، استخدم أيقونة بديلة
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              target.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                          <div className="hidden w-32 h-32 md:w-40 md:h-40 p-6 bg-[#4b2e83]/10 rounded-xl flex items-center justify-center shadow-lg">
                            <IconComponent className="w-16 h-16 md:w-20 md:h-20 text-[#4b2e83]" />
                          </div>
                          
                          {/* أسهم التنقل - تظهر فقط إذا كان هناك أكثر من صورة */}
                          {displayImages.length > 1 && (
                            <>
                              <button
                                onClick={() => setCurrentImageIndex(prev => 
                                  prev === 0 ? displayImages.length - 1 : prev - 1
                                )}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#4b2e83] rounded-full p-1 shadow-lg transition-all duration-200 hover:scale-110"
                                aria-label="الصورة السابقة"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setCurrentImageIndex(prev => 
                                  prev === displayImages.length - 1 ? 0 : prev + 1
                                )}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#4b2e83] rounded-full p-1 shadow-lg transition-all duration-200 hover:scale-110"
                                aria-label="الصورة التالية"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                        
                        {/* مؤشرات الصور - تظهر فقط إذا كان هناك أكثر من صورة */}
                        {displayImages.length > 1 && (
                          <div className="flex justify-center mt-2 gap-1">
                            {displayImages.map((_: string, index: number) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                  index === currentImageIndex 
                                    ? 'bg-[#4b2e83] scale-125' 
                                    : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                                aria-label={`الصورة ${index + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 arabic-text mb-2">
                      {titleAr}
                    </h1>
                  </div>
                </div>
              </div>

              {/* تفاصيل الخدمة */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white arabic-text mb-4 bg-[#4B2E83] px-6 py-3 rounded-lg inline-block">
                  تفاصيل الخدمة
                </h2>
                <p className="text-gray-700 arabic-text leading-relaxed">
                  {descriptionAr}
                </p>
              </div>

              {/* نبذة عن الخدمة */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white arabic-text mb-4 bg-[#4B2E83] px-6 py-3 rounded-lg inline-block">
                  نبذة عن الخدمة
                </h2>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-gray-700 arabic-text leading-relaxed">
                    {/* استخدام النبذة المختصرة من لوحة التحكم إذا كانت متوفرة */}
                    {shortDescriptionFromAdmin ? (
                      <p className="mb-3 text-right text-lg">
                        {shortDescriptionFromAdmin}
                      </p>
                    ) : (
                      // استخدام الوصف العادي كبديل
                      descriptionAr.split('\n').map((paragraph, index) => (
                        paragraph.trim() && (
                          <p key={index} className="mb-3 text-right">
                            {paragraph.trim()}
                          </p>
                        )
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* الخطوات */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white arabic-text mb-6 bg-[#4B2E83] px-6 py-3 rounded-lg inline-block">
                  الخطوات التي نتبعها في الخدمة
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* الخطوات */}
                  <div className="relative">
                    {/* استخدام خطوات العمل من لوحة التحكم إذا كانت متوفرة */}
                    {(workStepsFromAdmin.length > 0 ? workStepsFromAdmin : [
                      { title: "التخطيط", desc: "نقوم بدراسة متطلباتك وتحديد الأهداف المطلوبة للمشروع" },
                      { title: "التنفيذ", desc: "نبدأ في تنفيذ العمل وفقاً للمعايير المحددة والجودة العالية" },
                      { title: "التقييم", desc: "نراجع العمل ونتأكد من مطابقته للمواصفات المطلوبة" }
                    ]).map((item: any, index: number) => {
                      const stepNumber = index + 1;
                      return (
                      <div key={stepNumber} className="relative">
                        {/* سهم الربط بين الخطوات */}
                        {index < (workStepsFromAdmin.length > 0 ? workStepsFromAdmin.length - 1 : 2) && (
                          <div className="absolute right-5 top-20 flex flex-col items-center h-16">
                            {/* جسم السهم */}
                            <div className="w-0.5 h-12 bg-gradient-to-b from-[#4b2e83] to-[#7a4db3] relative">
                              {/* تأثير التوهج */}
                              <div className="absolute inset-0 w-0.5 bg-gradient-to-b from-[#4b2e83] to-[#7a4db3] blur-sm opacity-60"></div>
                              {/* نقطة متحركة على السهم */}
                              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#7a4db3] rounded-full animate-bounce opacity-80"></div>
                            </div>
                            
                            {/* رأس السهم */}
                            <div className="relative">
                              <svg 
                                className="w-4 h-4 text-[#7a4db3] drop-shadow-lg animate-pulse" 
                                fill="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 16l-6-6h12l-6 6z"/>
                              </svg>
                              {/* تأثير التوهج حول رأس السهم */}
                              <div className="absolute inset-0 w-4 h-4 bg-[#7a4db3] rounded-full blur-md opacity-30 animate-ping"></div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl mb-4 relative z-10 hover:shadow-lg transition-all duration-300 hover:border-[#4b2e83]/30">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#4b2e83] to-[#7a4db3] text-white rounded-full flex items-center justify-center font-bold shadow-lg relative">
                              {stepNumber}
                              {/* حلقة توهج حول الرقم */}
                              <div className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-[#4b2e83] to-[#7a4db3] rounded-full opacity-30 animate-ping"></div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 arabic-text text-lg mb-2">
                              {item.title}
                            </h3>
                            <p className="text-gray-600 arabic-text leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                  
                  {/* صورة الخطوات */}
                  <div className="flex justify-center">
                    <img 
                      src="/صورة الخطوات.png"
                      alt="خطوات العمل"
                      className="w-full max-w-md h-auto object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* معرض صور Portfolio - نماذج من أعمالنا */}
              {(() => {
                // استخدام portfolioImages من قاعدة البيانات
                const portfolioImages = (sAny?.portfolioImages || [])
                  .sort((a: any, b: any) => (a.order || 0) - (b.order || 0)) // ترتيب الصور حسب order
                
                // إخفاء القسم إذا لم توجد صور portfolio
                if (portfolioImages.length === 0) {
                  return null
                }
                
                return (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white arabic-text mb-6 bg-[#4B2E83] px-6 py-3 rounded-lg inline-block">
                      نماذج من أعمالنا
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {portfolioImages.map((imageObj: any, index: number) => {
                        const imageSrc = imageObj.url || imageObj
                        const imageAlt = imageObj.alt || `نموذج ${index + 1} من ${titleAr}`
                        
                        return (
                          <div 
                            key={imageObj._id || index} 
                            className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 hover:border-[#4b2e83]/30 transition-all duration-300 hover:shadow-lg cursor-pointer"
                            onClick={() => setSelectedGalleryImage(imageSrc)}
                          >
                            <div className="aspect-square p-4">
                              <img 
                                src={imageSrc}
                                alt={imageAlt}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  // في حالة عدم وجود الصورة، استخدم أيقونة بديلة
                                  const target = e.target as HTMLImageElement
                                  target.src = '/placeholder.svg'
                                }}
                              />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-4 left-4 right-4">
                                <p className="text-white text-sm font-medium arabic-text text-center">
                                  {imageAlt} - اضغط للتكبير
                                </p>
                              </div>
                            </div>
                            {/* مؤشر الترتيب للصور */}
                            <div className="absolute top-2 right-2 bg-[#4b2e83]/80 text-white text-xs px-2 py-1 rounded-full">
                              {index + 1}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* المميزات - Timeline */}
              <div className="mb-16">
                <ServiceFeaturesTimeline features={service.features?.ar || ['خدمة عالية الجودة', 'دعم فني مميز', 'تسليم في المواعيد المحددة', 'ضمان الرضا التام']} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  {/* السعر */}
                  <div className="text-center mb-6">
                    {/* عرض نسبة الخصم إذا كان هناك سعر أصلي */}
                    {normalizedPrice.originalAmount && normalizedPrice.originalAmount > normalizedPrice.amount && (
                      <div className="mb-3">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
                          <span className="text-lg">🔥</span>
                          <span className="font-bold text-lg">
                            خصم {Math.round(((normalizedPrice.originalAmount - normalizedPrice.amount) / normalizedPrice.originalAmount) * 100)}%
                          </span>
                          <span className="text-lg">🔥</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-3xl font-bold text-[#4b2e83] arabic-text mb-2">
                      {/* عرض السعر المحول حسب العملة المختارة */}
                      {format(normalizedPrice.amount, currency)}
                      {normalizedPrice.originalAmount && (
                        <span className="text-lg text-gray-400 line-through mr-2">
                          {format(normalizedPrice.originalAmount, currency)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 arabic-text text-sm">
                      مدة التنفيذ: {normalizedDeliveryTime.min}-{normalizedDeliveryTime.max} أيام
                    </p>
                    <p className="text-gray-600 arabic-text text-sm">
                      {normalizedRevisions} تعديلات مجانية
                    </p>
                    {/* تنبيه PayPal للعملات غير الدولار */}
                    {currency !== 'USD' && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-700 arabic-text text-xs">
                          💳 سيتم تحويل السعر للدولار الأمريكي في PayPal
                          <br />
                          <span className="text-xs opacity-75">
                            السعر بالدولار: {format(convert(normalizedPrice.amount, currency, 'USD'), 'USD')}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* الأزرار */}
                  <div className="space-y-3">
                    <Link 
                      href={`/order/payment?service=${service._id}&slug=${service.slug || 'service'}&name=${encodeURIComponent(titleAr)}`}
                      className="block w-full bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white py-3 px-6 rounded-xl font-bold arabic-text text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
                      onClick={() => {
                        // Store service info in localStorage for backup
                        try {
                          localStorage.setItem('selectedService', JSON.stringify({
                            id: service._id,
                            slug: service.slug,
                            title: titleAr,
                            description: descriptionAr,
                            price: normalizedPrice,
                            deliveryTime: normalizedDeliveryTime,
                            revisions: normalizedRevisions
                          }))
                        } catch (e) {
                          // Silent fail - localStorage might not be available
                        }
                      }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span>اطلب الخدمة الآن</span>
                        <span className="opacity-75 group-hover:opacity-100 transition-opacity">🚀</span>
                      </span>
                    </Link>
                    <Link 
                      href="/services"
                      className="block w-full bg-gradient-to-r from-accent/10 to-primary/10 hover:from-accent/20 hover:to-primary/20 text-primary py-3 px-6 rounded-xl font-bold arabic-text text-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-primary/20 group"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span>تصفح خدمات أخرى</span>
                        <span className="opacity-75 group-hover:opacity-100 transition-opacity">🔍</span>
                      </span>
                    </Link>
                    
                    {/* Quick contact button */}
                    <WhatsAppContactButton />
                  </div>

                  {/* معلومات إضافية */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="space-y-3 text-sm text-gray-600 arabic-text">
                      <div className="flex items-center justify-between">
                        <span>مدة التنفيذ</span>
                        <span>{normalizedDeliveryTime.min}-{normalizedDeliveryTime.max} أيام</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>التعديلات</span>
                        <span>{normalizedRevisions} مجانية</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>صيغ التسليم</span>
                        <span>{normalizedFormats.length || 3} صيغة</span>
                      </div>
                    </div>
                  </div>

                  {/* قسم التنويه المهم */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-orange-800 font-bold arabic-text mb-2">تنويه هام</h4>
                          <div className="space-y-2 text-sm text-orange-700 arabic-text">
                            <p className="leading-relaxed">
                              تشمل الخدمة {normalizedRevisions} تعديلين مجانيين فقط
                            </p>
                            <p className="leading-relaxed font-medium">
                              أي تعديل إضافي يُحسب كخدمة مستقلة ويتم تسعيره حسب نوع التعديل المطلوب
                            </p>
                            <p className="leading-relaxed">
                              الخدمة غير قابلة للإلغاء أو الاسترداد بعد إتمام الدفع
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Lightbox Modal لعرض الصور بحجم أكبر مع التنقل */}
      {selectedGalleryImage && (() => {
        const portfolioImages = (sAny?.portfolioImages || [])
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        
        if (portfolioImages.length === 0) return null
        
        const currentIndex = portfolioImages.findIndex((img: any) => 
          (img.url || img) === selectedGalleryImage
        )
        const currentImage = portfolioImages[currentIndex]
        const imageAlt = currentImage?.alt || `نموذج ${currentIndex + 1} من ${titleAr}`
        
        const goToPrevious = () => {
          const prevIndex = currentIndex === 0 ? portfolioImages.length - 1 : currentIndex - 1
          setSelectedGalleryImage(portfolioImages[prevIndex].url || portfolioImages[prevIndex])
        }
        
        const goToNext = () => {
          const nextIndex = currentIndex === portfolioImages.length - 1 ? 0 : currentIndex + 1
          setSelectedGalleryImage(portfolioImages[nextIndex].url || portfolioImages[nextIndex])
        }
        
        return (
          <div 
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedGalleryImage(null)}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* الصورة الرئيسية */}
              <img 
                src={selectedGalleryImage}
                alt={imageAlt}
                className="max-w-[85vw] max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              
              {/* أزرار التنقل - تظهر فقط إذا كان هناك أكثر من صورة */}
              {portfolioImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      goToPrevious()
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 transition-all hover:scale-110 shadow-lg"
                    aria-label="الصورة السابقة"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      goToNext()
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 transition-all hover:scale-110 shadow-lg"
                    aria-label="الصورة التالية"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              
              {/* زر الإغلاق */}
              <button
                onClick={() => setSelectedGalleryImage(null)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 transition-all hover:scale-110 shadow-lg"
                aria-label="إغلاق"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* معلومات الصورة */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-sm arabic-text text-center">
                  {imageAlt} ({currentIndex + 1} من {portfolioImages.length})
                </p>
              </div>
              
              {/* مؤشرات الصور المصغرة */}
              {portfolioImages.length > 1 && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg backdrop-blur-sm">
                  {portfolioImages.map((img: any, index: number) => (
                    <button
                      key={img._id || index}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedGalleryImage(img.url || img)
                      }}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentIndex 
                          ? 'border-white scale-110' 
                          : 'border-transparent hover:border-white/50'
                      }`}
                    >
                      <img 
                        src={img.url || img}
                        alt={img.alt || `نموذج ${index + 1}`}
                        className="w-full h-full object-contain bg-gray-50"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
