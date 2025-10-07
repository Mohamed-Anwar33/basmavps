"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, Clock, User, Search } from "lucide-react"

interface HomepageContent {
  banners: Array<{ _id: string; content: string | { ar: string; en: string }; image?: string | null; position?: string }>
  services: Array<{
    _id: string
    title: string | { ar: string; en: string }
    description: string | { ar: string; en: string }
    price?: { amount: number; currency: string; originalAmount?: number; originalCurrency?: string }
    category?: string
    deliveryTime?: { min: number; max: number }
  }>
  portfolio: Array<{ _id: string; title: string | { ar: string; en: string }; description?: string | { ar: string; en: string }; image?: string | null; type?: string }>
  faqs: Array<{ _id: string; question: string | { ar: string; en: string }; answer: string | { ar: string; en: string } }>
  blogs: Array<{ _id: string; title: string | { ar: string; en: string }; excerpt?: string | { ar: string; en: string }; coverImage?: string; slug: string; createdAt: string }>
}

export function HomepageFeed() {
  const [data, setData] = useState<HomepageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to get text content from multilingual or string field
  const getTextContent = (field: string | { ar: string; en: string } | undefined): string => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field.ar || field.en || '';
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch blogs and FAQs separately from existing endpoints
        const [blogsRes, faqsRes] = await Promise.allSettled([
          apiFetch("/blogs?lang=ar&limit=3", { method: "GET" }),
          apiFetch("/faqs?lang=ar&limit=5", { method: "GET" })
        ])
        
        const blogs = blogsRes.status === 'fulfilled' ? 
          (Array.isArray(blogsRes.value) ? blogsRes.value : (blogsRes.value as any)?.data?.blogs || (blogsRes.value as any)?.blogs || []) : []
        
        const faqs = faqsRes.status === 'fulfilled' ? 
          (Array.isArray(faqsRes.value) ? faqsRes.value : (faqsRes.value as any)?.data?.faqs || (faqsRes.value as any)?.faqs || []) : []

        setData({
          banners: [],
          services: [],
          portfolio: [],
          blogs: blogs.slice(0, 3),
          faqs: faqs.slice(0, 5)
        })
      } catch (e: any) {
        // Fallback to empty data instead of showing error
        setData({
          banners: [],
          services: [],
          portfolio: [],
          blogs: [],
          faqs: []
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground arabic-text">جاري تحميل المحتوى…</div>
        </div>
      </section>
    )
  }

  if (error || !data) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center text-destructive arabic-text">{error || "لا يوجد محتوى لعرضه حالياً"}</div>
        </div>
      </section>
    )
  }

  const blogs = data.blogs || []
  const faqs = data.faqs || []

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Blogs teaser */}
        {blogs.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-primary arabic-text">أحدث المقالات</h2>
              <Button asChild variant="outline" size="sm" className="arabic-text [&>*]:!text-black [&>*>*]:!text-black">
                <Link href="/blog" style={{color: '#000 !important'}}>
                  <span style={{color: '#000 !important'}}>عرض جميع المقالات</span>
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((b) => (
                <Card key={b._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {b.coverImage && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img src={b.coverImage} alt={getTextContent(b.title)} className="w-full h-full object-contain bg-gray-50" />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-primary arabic-text mb-2 line-clamp-2">{getTextContent(b.title)}</h3>
                    {b.excerpt && (
                      <p className="text-sm text-muted-foreground arabic-text mb-4 line-clamp-2">{getTextContent(b.excerpt)}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="arabic-text">فريق بصمة تصميم</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="arabic-text">{new Date(b.createdAt).toLocaleDateString("ar-SA")}</span>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="p-0 h-auto justify-start arabic-text [&>*]:!text-black [&>*>*]:!text-black">
                      <Link href={`/blog/${b.slug}`} className="flex items-center gap-2" style={{color: '#000 !important'}}>
                        <span style={{color: '#000 !important'}}>قراءة المقال</span>
                        <ArrowLeft className="h-3 w-3 rtl-flip" style={{color: '#000 !important'}} />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* FAQs teaser */}
        {faqs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-primary arabic-text">الأسئلة الشائعة</h2>
              <Button asChild variant="outline" size="sm" className="arabic-text [&>*]:!text-black [&>*>*]:!text-black">
                <Link href="/faq" style={{color: '#000 !important'}}>
                  <span style={{color: '#000 !important'}}>عرض الكل</span>
                </Link>
              </Button>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.slice(0, 5).map((f, idx) => (
                <AccordionItem key={f._id} value={`faq-${idx}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="text-right hover:no-underline py-4">
                    <span className="text-base md:text-lg font-medium arabic-text">{getTextContent(f.question)}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-right pb-4">
                    <p className="text-muted-foreground arabic-text">{getTextContent(f.answer)}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>
    </section>
  )
}
