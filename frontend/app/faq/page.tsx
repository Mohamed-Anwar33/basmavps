"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import { Search, MessageCircle, ArrowRight, Clock, CreditCard, Palette, FileText, Phone } from "lucide-react"
import { apiFetch } from "@/lib/api"

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [faqs, setFaqs] = useState<Array<{ _id: string; question: { ar: string; en: string }; answer: { ar: string; en: string }; category?: string; createdAt: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [pageSettings, setPageSettings] = useState({
    pageTitle: 'الأسئلة الشائعة',
    pageDescription: 'إجابات شاملة على أكثر الأسئلة التي يطرحها عملاؤنا',
    introText: 'نجمع هنا أكثر الأسئلة شيوعاً من عملائنا مع إجابات مفصلة لمساعدتك',
    contactText: 'لم تجد إجابة؟ تواصل معنا مباشرة وسنجيب على استفسارك'
  })

  const categories = [
    {
      id: "general",
      title: "أسئلة عامة",
      icon: MessageCircle,
      color: "text-blue-600"
    },
    {
      id: "pricing",
      title: "الأسعار والدفع",
      icon: CreditCard,
      color: "text-green-600"
    },
    {
      id: "design",
      title: "التصميم والجودة",
      icon: Palette,
      color: "text-purple-600"
    },
    {
      id: "delivery",
      title: "التسليم والتعديلات",
      icon: Clock,
      color: "text-orange-600"
    },
    {
      id: "files",
      title: "الملفات والصيغ",
      icon: FileText,
      color: "text-indigo-600"
    }
  ]

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        // تحميل الأسئلة الشائعة
        const faqRes = await apiFetch<{ success: boolean; data: { faqs: Array<{ _id: string; question: { ar: string; en: string }; answer: { ar: string; en: string }; category?: string; createdAt: string }> } }>('/faqs?lang=ar', { method: 'GET' })
        setFaqs(faqRes?.data?.faqs || [])

        // تحميل إعدادات الصفحة
        try {
          const settingsRes = await apiFetch('/settings?category=faq', { method: 'GET' }) as any
          
          let settingsArray = []
          if (settingsRes?.success && settingsRes?.data) {
            settingsArray = settingsRes.data
          } else if (Array.isArray(settingsRes)) {
            settingsArray = settingsRes
          } else if (settingsRes?.data && Array.isArray(settingsRes.data)) {
            settingsArray = settingsRes.data
          }

          if (settingsArray && Array.isArray(settingsArray)) {
            const settings: Record<string, any> = {}
            settingsArray.forEach((item: any) => {
              settings[item.key] = item.value
            })
            
            // تحديث إعدادات الصفحة
            setPageSettings(prev => ({
              pageTitle: settings.pageTitle || prev.pageTitle,
              pageDescription: settings.pageDescription || prev.pageDescription,
              introText: settings.introText || prev.introText,
              contactText: settings.contactText || prev.contactText
            }))
          }
        } catch (settingsError) {
          // تجاهل أخطاء تحميل الإعدادات واستخدام القيم الافتراضية
        }

      } catch (e: any) {
        setError(e?.message || 'فشل تحميل الأسئلة الشائعة')
        setFaqs([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.ar.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || 
      faq.category === selectedCategory ||
      (selectedCategory === "general" && (!faq.category || faq.category === "general"))
    
    return matchesSearch && matchesCategory
  })

  // حساب عدد الأسئلة لكل تصنيف
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return faqs.length
    return faqs.filter(faq => 
      faq.category === categoryId || 
      (categoryId === "general" && (!faq.category || faq.category === "general"))
    ).length
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16 relative z-20">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 arabic-text">
              {pageSettings.pageTitle}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed arabic-text">
              {pageSettings.pageDescription}
            </p>
          </div>

          {/* Intro Text */}
          {pageSettings.introText && (
            <div className="text-center mb-12">
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed arabic-text">
                {pageSettings.introText}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Search */}
              <Card>
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="ابحث في الأسئلة..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-4 pr-10 arabic-text"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-primary mb-4 arabic-text">التصنيفات</h3>
                  <div className="space-y-2">
                    {/* جميع الأسئلة */}
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-right ${
                        selectedCategory === "all" 
                          ? "bg-primary/10 border border-primary/20" 
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <MessageCircle className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium text-foreground arabic-text">جميع الأسئلة</div>
                        <div className="text-sm text-muted-foreground arabic-text">{getCategoryCount("all")} سؤال</div>
                      </div>
                    </button>
                    
                    {categories.map((category) => {
                      const Icon = category.icon
                      const categoryCount = getCategoryCount(category.id)
                      const isSelected = selectedCategory === category.id
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-right ${
                            isSelected 
                              ? "bg-primary/10 border border-primary/20" 
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${category.color}`} />
                          <div className="flex-1">
                            <div className="font-medium text-foreground arabic-text">{category.title}</div>
                            <div className="text-sm text-muted-foreground arabic-text">{categoryCount} سؤال</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="font-bold text-primary mb-2 arabic-text">لم تجد إجابة؟</h3>
                  <p className="text-sm text-muted-foreground mb-4 arabic-text">
                    {pageSettings.contactText}
                  </p>
                  <Button asChild size="sm" className="bg-primary hover:bg-accent [&>*]:!text-black [&>*>*]:!text-black">
                    <Link href="/contact" className="arabic-text" style={{color: '#000 !important'}}>
                      <span style={{color: '#000 !important'}}>تواصل معنا</span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* عرض التصنيف المحدد */}
              {!loading && !error && (
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-foreground arabic-text">
                      {selectedCategory === "all" 
                        ? "جميع الأسئلة" 
                        : categories.find(c => c.id === selectedCategory)?.title || "أسئلة عامة"
                      }
                    </h2>
                    <span className="text-sm text-muted-foreground arabic-text">
                      ({filteredFAQs.length} سؤال)
                    </span>
                  </div>
                  {selectedCategory !== "all" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedCategory("all")}
                      className="arabic-text"
                    >
                      عرض الكل
                    </Button>
                  )}
                </div>
              )}
              
              {loading && (
                <div className="text-center py-16 text-muted-foreground arabic-text">جاري تحميل الأسئلة...</div>
              )}
              {error && !loading && (
                <div className="text-center py-16 text-destructive arabic-text">{error}</div>
              )}
              {filteredFAQs.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFAQs.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`item-${index}`}
                      className="border border-border rounded-lg px-6"
                    >
                      <AccordionTrigger className="text-right hover:no-underline py-6">
                        <span className="text-lg font-medium text-foreground leading-relaxed arabic-text">
                          {faq.question.ar}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-right pb-6">
                        <p className="text-muted-foreground leading-relaxed arabic-text">
                          {faq.answer.ar}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
                    <h3 className="text-xl font-bold text-foreground mb-4 arabic-text">لم نعثر على نتائج</h3>
                    <p className="text-muted-foreground mb-6 arabic-text">
                      جرب البحث بكلمات أخرى أو تصفح الأسئلة حسب التصنيف
                    </p>
                    <Button onClick={() => setSearchQuery("")} variant="outline" className="arabic-text">
                      عرض جميع الأسئلة
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Additional Help */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Phone className="h-12 w-12 mx-auto text-green-600 mb-4" />
                    <h3 className="font-bold text-foreground mb-2 arabic-text">استشارة مجانية</h3>
                    <p className="text-sm text-muted-foreground mb-4 arabic-text">
                      احصل على استشارة مجانية لمساعدتك في اختيار الخدمة المناسبة
                    </p>
                    <Button asChild variant="outline" size="sm" className="[&>*]:!text-black [&>*>*]:!text-black">
                      <Link href="/contact" className="arabic-text" style={{color: '#000 !important'}}>
                        <span style={{color: '#000 !important'}}>طلب استشارة</span>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <FileText className="h-12 w-12 mx-auto text-primary mb-4" />
                    <h3 className="font-bold text-foreground mb-2 arabic-text">دليل الخدمات</h3>
                    <p className="text-sm text-muted-foreground mb-4 arabic-text">
                      تعرف على جميع خدماتنا بالتفصيل والأسعار والمزايا
                    </p>
                    <Button asChild variant="outline" size="sm" className="[&>*]:!text-black [&>*>*]:!text-black">
                      <Link href="/services" className="flex items-center gap-2 arabic-text" style={{color: '#000 !important'}}>
                        <span style={{color: '#000 !important'}}>عرض الخدمات</span>
                        <ArrowRight className="h-4 w-4 rotate-180" style={{color: '#000 !important'}} />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      <Footer />
    </div>
  )
}
