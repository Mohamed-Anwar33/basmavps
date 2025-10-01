'use client'

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { Share2, Layout, PenTool, FileUser, Crown, Linkedin, MessageSquare, Settings, Star } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { ServiceFeaturesTimeline } from "@/components/service-details"
import { useEffect, useState } from 'react'
import { ServiceType } from "@/types/service"

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

export default function ServicePage({ params }: { params: { serviceId: string } }) {
  const [service, setService] = useState<ServiceType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await apiFetch(`/services/${params.serviceId}`)
        setService(response as ServiceType)
      } catch (error) {
        setService(null)
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [params.serviceId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    )
  }

  if (!service) {
    notFound()
  }

  const titleAr = service.title?.ar || 'خدمة غير محددة'
  const descriptionAr = service.description?.ar || 'لا يوجد وصف متاح'
  const price = service.price?.SAR || service.price?.USD || 0
  const currency = service.price?.SAR ? 'ريال' : 'دولار'

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
              {/* Service Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#4b2e83] arabic-text mb-4">{titleAr}</h1>
                <p className="text-gray-700 arabic-text leading-relaxed mb-6">{descriptionAr}</p>
              </div>

              {/* Service Images */}
              {service.images && service.images.length > 0 && (
                <div className="mb-8">
                  <img
                    src={service.images[0]}
                    alt={titleAr}
                    className="w-full h-64 object-cover rounded-lg shadow-lg"
                  />
                </div>
              )}

              {/* Features Timeline */}
              <div className="mb-8">
                <ServiceFeaturesTimeline 
                  features={service.features?.ar || ['خدمة عالية الجودة', 'دعم فني مميز', 'تسليم في المواعيد المحددة', 'ضمان الرضا التام']} 
                />
              </div>

              {/* Service Details */}
              {service.uiTexts?.details?.ar && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-[#4b2e83] arabic-text mb-4">تفاصيل إضافية</h3>
                  <p className="text-gray-700 arabic-text leading-relaxed">
                    {service.uiTexts.details.ar}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-[#4b2e83] arabic-text mb-2">
                      {price} {currency}
                    </div>
                    <p className="text-gray-600 arabic-text text-sm">
                      مدة التنفيذ: {service.deliveryTime?.min || 1}-{service.deliveryTime?.max || 3} أيام
                    </p>
                    <p className="text-gray-600 arabic-text text-sm">
                      {service.revisions || 2} تعديلات مجانية
                    </p>
                  </div>

                  {/* Order Button */}
                  <div className="space-y-3">
                    <button className="w-full bg-[#4b2e83] text-white px-6 py-3 rounded-lg font-medium arabic-text hover:bg-[#5a3594] transition-colors">
                      اطلب الخدمة الآن
                    </button>
                    <button className="w-full border border-[#4b2e83] text-[#4b2e83] px-6 py-3 rounded-lg font-medium arabic-text hover:bg-[#4b2e83] hover:text-white transition-colors">
                      تواصل معنا
                    </button>
                  </div>

                  {/* Service Info */}
                  <div className="mt-6 space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="arabic-text">الفئة:</span>
                      <span className="arabic-text">{service.category}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="arabic-text">الحالة:</span>
                      <span className={`arabic-text ${service.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {service.isActive ? 'متاح' : 'غير متاح'}
                      </span>
                    </div>
                    {service.isFeatured && (
                      <div className="flex justify-between items-center">
                        <span className="arabic-text">مميز:</span>
                        <span className="text-yellow-600 arabic-text">⭐ خدمة مميزة</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
