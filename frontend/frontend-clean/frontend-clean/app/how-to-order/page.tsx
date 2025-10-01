"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Sparkles, Clock, Shield, MessageCircle, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchPublicPageContent } from "@/lib/api"

export default function HowToOrderPage() {
  const [content, setContent] = useState<any | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Fallback content mirrors the original static UI
  const fallback = {
    sections: [
      {
        id: 'hero',
        data: {
          badge: { ar: 'دليل الطلب الشامل' },
          title: { ar: 'كيف تطلب خدمتك؟' },
          description: { ar: 'في "بصمة تصميم"، نجعل طلب خدمتك سهلاً وسريعاً بخطوات واضحة ومباشرة' },
        }
      },
      {
        id: 'steps',
        data: {
          heading: { ar: 'خطوات بسيطة للحصول على خدمتك' },
          items: [
            { order: 1, title: { ar: 'اختر خدمتك' }, description: { ar: 'تصفح قسم الخدمات واختر الخدمة التي تحتاجها من مجموعة خدماتنا المتنوعة' }, theme: 'primary' },
            { order: 2, title: { ar: 'أكمل الدفع' }, description: { ar: 'ادفع بأمان عبر PayPal أو وسائل الدفع المتاحة بخطوات سريعة ومحمية' }, theme: 'emerald' },
            { order: 3, title: { ar: 'ابدأ التنفيذ' }, description: { ar: 'تواصل معنا عبر واتساب لتوضيح تفاصيل طلبك ونبدأ التنفيذ فوراً' }, theme: 'amber' },
          ],
          processHighlights: [
            { text: { ar: 'لا حاجة لنماذج معقدة' } },
            { text: { ar: 'تواصل مباشر مع الفريق' } },
            { text: { ar: 'بداية فورية للتنفيذ' } },
          ]
        }
      },
      {
        id: 'notes',
        data: {
          heading: { ar: 'ملاحظات مهمة لضمان أفضل خدمة' },
          items: [
            { title: { ar: 'التحضير المسبق' }, description: { ar: 'يُرجى تجهيز وصف واضح ومفصل لطلبك قبل بدء المحادثة لضمان فهم متطلباتك بدقة' }, theme: 'amber', icon: 'clock' },
            { title: { ar: 'الأسعار والتعديلات' }, description: { ar: 'الأسعار ثابتة لكل خدمة، والتعديلات محدودة حسب نوع الخدمة المطلوبة' }, theme: 'blue', icon: 'shield' },
            { title: { ar: 'سياسة الإلغاء' }, description: { ar: 'جميع الخدمات غير قابلة للإلغاء أو الاسترداد بعد إتمام عملية الدفع' }, theme: 'red', icon: 'alert' },
            { title: { ar: 'التسليم الرقمي' }, description: { ar: 'خدمة "قالب السيرة الذاتية الجاهز" تُرسل مباشرة عبر البريد الإلكتروني ولا تتطلب تواصل عبر واتساب' }, theme: 'emerald', icon: 'message' },
          ]
        }
      },
      {
        id: 'cta',
        data: {
          title: { ar: 'جاهز لبدء مشروعك؟' },
          description: { ar: 'اختر خدمتك الآن وابدأ رحلة إبداعية مع فريق بصمة تصميم' },
          button: { text: { ar: 'تصفح الخدمات' }, link: '/services' }
        }
      }
    ]
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await fetchPublicPageContent('howToOrder')
        // Use fallback only when API returns null/undefined; if data exists but fields are empty, respect emptiness
        if (mounted) setContent((data ?? null) ? data : fallback)
      } catch (e) {
        if (mounted) setContent(fallback)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const hero = content?.sections?.find((s: any) => s.id === 'hero')?.data
  const steps = content?.sections?.find((s: any) => s.id === 'steps')?.data
  const notes = content?.sections?.find((s: any) => s.id === 'notes')?.data
  const cta = content?.sections?.find((s: any) => s.id === 'cta')?.data

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50/30">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 relative overflow-hidden z-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium arabic-text mb-6">
              <Sparkles className="h-4 w-4" />
              {hero?.badge?.ar}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary arabic-text mb-6 leading-tight">
              {hero?.title?.ar}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground arabic-text mb-8 leading-relaxed">
              {hero?.description?.ar}
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 relative z-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-primary arabic-text mb-12">
              {steps?.heading?.ar}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Step 1 */}
              <Card className="relative overflow-hidden border-violet-200/70 hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-xl font-bold arabic-text mb-4 text-primary">{steps?.items?.[0]?.title?.ar}</h3>
                  <p className="text-muted-foreground arabic-text leading-relaxed">{steps?.items?.[0]?.description?.ar}</p>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="relative overflow-hidden border-violet-200/70 hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-xl font-bold arabic-text mb-4 text-emerald-600">{steps?.items?.[1]?.title?.ar}</h3>
                  <p className="text-muted-foreground arabic-text leading-relaxed">{steps?.items?.[1]?.description?.ar}</p>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="relative overflow-hidden border-violet-200/70 hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-xl font-bold arabic-text mb-4 text-amber-600">{steps?.items?.[2]?.title?.ar}</h3>
                  <p className="text-muted-foreground arabic-text leading-relaxed">{steps?.items?.[2]?.description?.ar}</p>
                </CardContent>
              </Card>
            </div>

            {/* Process Flow */}
            <Card className="bg-gradient-to-r from-primary/5 to-purple-100/50 border-primary/20 mb-12">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold arabic-text text-center mb-8 text-primary">
                  {steps?.heading?.ar}
                </h3>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3 text-primary">
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                    <span className="arabic-text font-medium">{steps?.processHighlights?.[0]?.text?.ar}</span>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
                  <div className="flex items-center gap-3 text-primary">
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                    <span className="arabic-text font-medium">{steps?.processHighlights?.[1]?.text?.ar}</span>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
                  <div className="flex items-center gap-3 text-primary">
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                    <span className="arabic-text font-medium">{steps?.processHighlights?.[2]?.text?.ar}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-violet-50/30 relative z-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center arabic-text mb-12 text-primary">
              {notes?.heading?.ar}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-amber-200/70 bg-amber-50/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold arabic-text mb-2 text-amber-800">{notes?.items?.[0]?.title?.ar}</h3>
                      <p className="text-amber-700 arabic-text text-sm leading-relaxed">{notes?.items?.[0]?.description?.ar}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200/70 bg-blue-50/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold arabic-text mb-2 text-blue-800">{notes?.items?.[1]?.title?.ar}</h3>
                      <p className="text-blue-700 arabic-text text-sm leading-relaxed">{notes?.items?.[1]?.description?.ar}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200/70 bg-red-50/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold arabic-text mb-2 text-red-800">{notes?.items?.[2]?.title?.ar}</h3>
                      <p className="text-red-700 arabic-text text-sm leading-relaxed">{notes?.items?.[2]?.description?.ar}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-200/70 bg-emerald-50/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold arabic-text mb-2 text-emerald-800">{notes?.items?.[3]?.title?.ar}</h3>
                      <p className="text-emerald-700 arabic-text text-sm leading-relaxed">{notes?.items?.[3]?.description?.ar}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative z-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Card className="bg-gradient-to-br from-primary to-purple-600 text-white border-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
              <CardContent className="p-12 relative">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold arabic-text mb-4">{cta?.title?.ar}</h2>
                <p className="text-xl arabic-text mb-8 text-white/90">{cta?.description?.ar}</p>
                <a
                  href={cta?.button?.link}
                  className="inline-flex items-center justify-center rounded-lg bg-white text-primary px-8 py-4 text-lg font-bold arabic-text hover:bg-white/90 transition-colors duration-300 shadow-lg"
                >
                  {cta?.button?.text?.ar}
                  <ArrowRight className="mr-2 h-5 w-5" />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

