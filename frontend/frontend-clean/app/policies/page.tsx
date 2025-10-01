import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield, FileText, Clock, CreditCard, AlertTriangle, CheckCircle, ArrowRight, Sparkles, Scale, Eye, Truck } from "lucide-react"
import { apiFetch } from "@/lib/api"

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0
export default async function PoliciesPage() {
  // Load dynamic policies content from settings
  let terms = ""
  let refund = ""
  let delivery = ""
  let privacy = ""
  let contactEmail = "contact@basmadesign.com"
  
  try {
    const response: any = await apiFetch('/settings?category=policies', { method: 'GET' })
    
    // Handle the response structure properly
    let policiesData = response
    if (response && response.data) {
      policiesData = response.data
    }
    
    const m: Record<string, any> = {}
    if (Array.isArray(policiesData)) {
      policiesData.forEach((s: any) => { m[s.key] = s.value })
    }
    terms = m.terms || terms
    refund = m.refund || refund
    delivery = m.delivery || delivery
    privacy = m.privacy || privacy
  } catch (error) {
  }

  // Load contact email
  try {
    const contactResponse: any = await apiFetch('/settings?category=contact', { method: 'GET' })
    if (Array.isArray(contactResponse)) {
      const emailSetting = contactResponse.find(s => s.key === 'email')
      if (emailSetting && emailSetting.value) {
        contactEmail = emailSetting.value
      }
    }
  } catch (error) {
  }

  const policies = [
    { id: 'terms', title: 'الشروط والأحكام', icon: Scale, text: terms, color: 'from-blue-500 to-indigo-600' },
    { id: 'refund', title: 'سياسة عدم الاسترداد', icon: CreditCard, text: refund, color: 'from-red-500 to-pink-600' },
    { id: 'delivery', title: 'سياسة التسليم', icon: Truck, text: delivery, color: 'from-purple-500 to-violet-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50/30">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium arabic-text mb-6">
              <Shield className="h-4 w-4" />
              الشفافية والوضوح
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary arabic-text mb-6 leading-tight">
              السياسات والشروط
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground arabic-text mb-8 leading-relaxed">
              معلومات مهمة وشاملة حول شروط الخدمة وسياساتنا لضمان تجربة واضحة ومفهومة
            </p>
          </div>
        </div>
      </section>

      <div className="py-16">
        <div className="container mx-auto px-4">

          {/* Important Notice */}
          <Card className="mb-12 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/70 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
            <CardContent className="p-8 relative">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-800 mb-2 arabic-text text-lg">تنويه مهم</h3>
                  <p className="text-amber-700 arabic-text leading-relaxed">
                    يرجى قراءة جميع السياسات بعناية قبل طلب أي خدمة. استخدام خدماتنا يعني موافقتك على جميع الشروط والأحكام المذكورة أدناه.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policies Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 items-start">
            {policies.map((policy, index) => {
              const Icon = policy.icon
              const text = policy.text?.trim() || ''
              const hasContent = text.length > 0
              return (
                <Card key={policy.id} id={policy.id} className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-violet-200/70 overflow-hidden relative ${hasContent ? 'h-auto' : 'h-fit'}`}>
                  <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity" 
                       style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }}></div>
                  <CardHeader className="relative pb-4">
                    <CardTitle className="flex items-center gap-4 text-xl arabic-text">
                      <div className={`w-12 h-12 bg-gradient-to-br ${policy.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="group-hover:text-primary transition-colors">{policy.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={`relative ${hasContent ? 'pb-6' : 'pb-8'}`}>
                    {text ? (
                      <div className="text-muted-foreground leading-relaxed arabic-text whitespace-pre-line">
                        {text}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FileText className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-muted-foreground italic arabic-text text-sm">سيتم إضافة المحتوى قريبًا…</p>
                        <p className="text-xs text-muted-foreground mt-1 arabic-text">نعمل على تحديث هذا القسم</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Contact Information */}
          <Card className="bg-gradient-to-br from-primary to-purple-600 text-white border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <CardContent className="p-12 text-center relative">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4 arabic-text">
                هل لديك استفسارات حول السياسات؟
              </h3>
              <p className="text-xl arabic-text mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
                إذا كان لديك أي أسئلة أو تحتاج لتوضيحات إضافية حول أي من سياساتنا، 
                لا تتردد في التواصل معنا
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-8">
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm text-white/80 mb-2 arabic-text">البريد الإلكتروني</p>
                    <p className="font-medium text-white">{contactEmail}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm text-white/80 mb-2 arabic-text">الواتساب</p>
                    <p className="font-medium text-white arabic-text">متاح للاستفسارات</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-white text-primary hover:bg-white/90 font-bold">
                  <Link href="/contact" className="arabic-text flex items-center gap-2">
                    تواصل معنا
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Link href="/faq" className="flex items-center gap-2 arabic-text">
                    <span>الأسئلة الشائعة</span>
                    <ArrowRight className="h-4 w-4 rotate-180" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <div className="mt-12 text-center">
            <Card className="bg-slate-50 border-slate-200/70 inline-block">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 justify-center mb-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <p className="text-sm font-medium text-slate-700 arabic-text">آخر تحديث: يناير 2025</p>
                </div>
                <p className="text-xs text-slate-600 arabic-text">
                  تحتفظ بصمة تصميم بحق تعديل هذه السياسات في أي وقت مع إشعار مسبق للعملاء
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
