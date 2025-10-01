"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Search, 
  Filter, 
  ArrowLeft,
  Instagram,
  Monitor,
  PenTool,
  FileText,
  Zap,
  Users,
  Loader2
} from "lucide-react"
import { apiFetch } from "@/lib/api"
import { getArabicText } from "@/lib/text-utils"

const categories = [
  { id: "all", name: "جميع الخدمات" },
  { id: "design", name: "التصميم" },
  { id: "content", name: "المحتوى" },
  { id: "branding", name: "الهوية البصرية" },
  { id: "social", name: "السوشيال ميديا" }
]

// Service type for API data
type ServiceType = {
  _id: string
  slug?: string
  title: { ar: string; en: string } | string
  description: { ar: string; en: string } | string
  price: {
    SAR: number
    USD: number
  }
  deliveryTime: {
    min: number
    max: number
  }
  revisions: number
  category: string
  features: { ar: string[]; en: string[] } | string[]
  isActive: boolean
}

// Icon mapping for categories
const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, any> = {
    'social': Instagram,
    'social-media': Instagram,
    'design': Monitor,
    'banners': Monitor,
    'content': PenTool,
    'branding': Zap,
    'logos': Zap,
    'linkedin': Users,
    'resumes': FileText,
    'website': Monitor,
    'management': PenTool,
  }
  return iconMap[category] || Monitor
}

// Style mapping for categories
const getCategoryStyle = (category: string) => {
  const styleMap: Record<string, { gradient: string; iconColor: string }> = {
    'social': { gradient: "from-pink-500/10 to-purple-500/10", iconColor: "text-pink-600" },
    'social-media': { gradient: "from-pink-500/10 to-purple-500/10", iconColor: "text-pink-600" },
    'design': { gradient: "from-blue-500/10 to-cyan-500/10", iconColor: "text-blue-600" },
    'banners': { gradient: "from-blue-500/10 to-cyan-500/10", iconColor: "text-blue-600" },
    'content': { gradient: "from-green-500/10 to-emerald-500/10", iconColor: "text-green-600" },
    'branding': { gradient: "from-yellow-500/10 to-orange-500/10", iconColor: "text-yellow-600" },
    'logos': { gradient: "from-yellow-500/10 to-orange-500/10", iconColor: "text-yellow-600" },
    'linkedin': { gradient: "from-indigo-500/10 to-blue-500/10", iconColor: "text-indigo-600" },
    'resumes': { gradient: "from-orange-500/10 to-red-500/10", iconColor: "text-orange-600" },
    'website': { gradient: "from-purple-500/10 to-pink-500/10", iconColor: "text-purple-600" },
    'management': { gradient: "from-cyan-500/10 to-blue-500/10", iconColor: "text-cyan-600" },
  }
  return styleMap[category] || { gradient: "from-gray-500/10 to-slate-500/10", iconColor: "text-gray-600" }
}

export default function ServicesContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [services, setServices] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiFetch<{ success: boolean; data: { services: ServiceType[] } }>("/services", { method: "GET" })
        
        const data = response?.data?.services || []
        if (!Array.isArray(data)) {
          throw new Error('البيانات المستلمة ليست من النوع المطلوب')
        }
        
        // Filter only active services
        const activeServices = data.filter((s: ServiceType) => s.isActive)
        setServices(activeServices)
      } catch (e: any) {
        setError(e?.message || "فشل تحميل الخدمات")
        setServices([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchServices()
  }, [])

  const filteredServices = services.filter(service => {
    const title = typeof service.title === 'string' ? service.title : getArabicText(service.title)
    const description = typeof service.description === 'string' ? service.description : getArabicText(service.description)
    
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen py-12 pt-24">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="arabic-text">جاري تحميل الخدمات...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen py-12 pt-24">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-destructive arabic-text mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} className="arabic-text">
                إعادة المحاولة
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 pt-24">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 arabic-text">
            خدماتنا الإبداعية
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed arabic-text">
            مجموعة شاملة من الخدمات الاحترافية لتلبية جميع احتياجاتك الرقمية والإبداعية
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ابحث عن الخدمة التي تريدها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-12 h-12 text-lg arabic-text"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Filter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap arabic-text"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {filteredServices.map((service, index) => {
            const Icon = getCategoryIcon(service.category)
            const categoryStyle = getCategoryStyle(service.category)
            const title = typeof service.title === 'string' ? service.title : getArabicText(service.title)
            const description = typeof service.description === 'string' ? service.description : getArabicText(service.description)
            
            return (
              <Card 
                key={service._id}
                className="text-card-foreground flex flex-col gap-4 rounded-xl py-4 shadow-sm group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white border border-gray-200 hover:border-primary/30 relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-lg font-bold arabic-text text-gray-900 mb-1 text-right line-clamp-1">
                        {title}
                      </div>
                      <p className="text-sm text-gray-600 arabic-text leading-relaxed text-right line-clamp-1">
                        {description}
                      </p>
                    </div>
                    <div className={`w-11 h-11 bg-gradient-to-br ${categoryStyle.gradient} rounded-full ring-1 ring-primary/10 shadow-sm flex items-center justify-center ml-4 transition-colors`}>
                      <Icon className={`h-5 w-5 ${categoryStyle.iconColor}`} />
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

        {/* No Results */}
        {filteredServices.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted/20 rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4 arabic-text">لم نعثر على نتائج</h3>
            <p className="text-muted-foreground mb-6 arabic-text">جرب البحث بكلمات مختلفة أو تصفح جميع الخدمات</p>
            <Button onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }} className="arabic-text">
              عرض جميع الخدمات
            </Button>
          </div>
        )}

        {/* Custom Service CTA */}
        <div className="mt-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-6 md:p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 arabic-text">
            لم تجد ما تبحث عنه؟
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto arabic-text">
            نقدم خدمات مخصصة حسب احتياجاتك. تواصل معنا لمناقشة مشروعك الخاص
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-accent text-primary-foreground font-medium arabic-text">
              <Link href="/contact">تواصل لطلب خدمة مخصصة</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="arabic-text">
              <Link href="/about">تعرف على فريقنا</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
