import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  FileImage, 
  Star,
  Instagram, 
  Monitor, 
  PenTool, 
  FileText, 
  Zap, 
  Users,
  Home,
  Check,
  RefreshCw
} from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"

interface ServiceDetailProps {
  service: {
    title: { ar: string; en?: string } | string
    description: { ar: string; en?: string } | string
    scope: string
    deliverables: string[]
    revisions: string
    formats: string
    deliveryTime: string
    price: string
    category: string
  }
  serviceId: string
}

// Service icons mapping
const serviceIcons = {
  "1": Instagram,
  "2": Monitor,
  "3": PenTool,
  "4": FileText,
  "5": Zap,
  "6": Users,
  "7": Monitor,
  "8": PenTool
}

// Enhanced service data with detailed information
const enhancedServices = {
  "1": {
    shortDescription: "بوستات احترافية وتصاميم تفاعلية للمنصات الاجتماعية",
    fullDescription: "نقدم خدمة شاملة لتصميم المحتوى البصري للمنصات الاجتماعية بأعلى معايير الجودة والإبداع. نساعدك في إنشاء هوية بصرية متميزة تجذب جمهورك وتزيد من التفاعل مع علامتك التجارية.",
    gradient: "from-pink-500/10 to-purple-500/10",
    iconColor: "text-pink-600",
    scopeItems: [
      "تحليل الجمهور المستهدف والمنافسين",
      "وضع استراتيجية بصرية متكاملة",
      "تصميم بوستات إبداعية ومتنوعة",
      "إنشاء قوالب قابلة للتخصيص",
      "تصميم الكاروسيل والمحتوى التفاعلي"
    ],
    detailedDeliverables: [
      "10 تصاميم بوست أساسية",
      "5 تصاميم كاروسيل تفاعلي",
      "3 قوالب قابلة للتعديل",
      "تصميم غلاف وصورة البروفايل",
      "دليل الألوان والخطوط المستخدمة"
    ],
    fileFormats: ["PSD", "PNG", "JPG", "AI"],
    samples: [
      "أمثلة على تصاميم إبداعية سابقة",
      "نماذج كاروسيل تفاعلي",
      "تصاميم متنوعة حسب المناسبات",
      "أفكار إبداعية للمحتوى"
    ]
  },
  "2": {
    shortDescription: "بنرات جذابة للإعلانات والمتاجر الإلكترونية",
    fullDescription: "تصميم بنرات إعلانية احترافية تجذب الانتباه وتحقق أهدافك التسويقية. نحرص على إنشاء تصاميم تتماشى مع هوية علامتك التجارية وتحفز العملاء على اتخاذ إجراء.",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-600",
    scopeItems: [
      "دراسة الهدف من البنر والجمهور المستهدف",
      "اختيار الألوان والخطوط المناسبة",
      "تصميم يتماشى مع الهوية البصرية",
      "التركيز على رسالة واضحة ومؤثرة",
      "تحسين التصميم للمنصات المختلفة"
    ],
    detailedDeliverables: [
      "تصميم البنر بالأبعاد المطلوبة",
      "3 أحجام مختلفة للبنر",
      "نسخة للطباعة عالية الدقة",
      "نسخة للويب محسنة",
      "ملف المصدر للتعديل المستقبلي"
    ],
    fileFormats: ["PSD", "PNG", "JPG", "AI", "PDF"],
    samples: [
      "بنرات إعلانية متنوعة",
      "تصاميم للمتاجر الإلكترونية",
      "بنرات للمناسبات الخاصة",
      "أمثلة على الحملات الناجحة"
    ]
  },
  "3": {
    shortDescription: "محتوى إبداعي يجذب ويحول القراء إلى عملاء",
    fullDescription: "نقدم خدمة كتابة محتوى تسويقي مؤثر يتحدث بلغة جمهورك ويحقق أهدافك التسويقية. فريقنا من الكتاب المتخصصين يضمن محتوى عالي الجودة ومحسن لمحركات البحث.",
    gradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-600",
    scopeItems: [
      "بحث وتحليل السوق والجمهور المستهدف",
      "وضع استراتيجية محتوى متكاملة",
      "كتابة محتوى إبداعي ومقنع",
      "تحسين المحتوى لمحركات البحث",
      "مراجعة لغوية وإملائية شاملة"
    ],
    detailedDeliverables: [
      "10 بوستات تسويقية جاهزة للنشر",
      "5 سكربتات للفيديوهات القصيرة",
      "مقال تسويقي طويل (800-1200 كلمة)",
      "دليل إرشادي للنبرة والأسلوب",
      "اقتراحات للهاشتاجات المناسبة"
    ],
    fileFormats: ["DOC", "PDF", "TXT"],
    samples: [
      "نماذج من المحتوى السابق",
      "أمثلة على السكربتات الناجحة",
      "مقالات تسويقية مؤثرة",
      "محتوى متنوع حسب المجال"
    ]
  }
  // يمكن إضافة باقي الخدمات بنفس الطريقة
}

// Helper function to extract text from multilingual object or string
const getText = (text: { ar: string; en?: string } | string): string => {
  if (typeof text === 'string') return text
  return text.ar || text.en || ''
}

export function ServiceDetail({ service, serviceId }: ServiceDetailProps) {
  const [contactEmail, setContactEmail] = useState('contact@basmadesign.com')
  const Icon = serviceIcons[serviceId as keyof typeof serviceIcons] || FileText
  const enhancedData = enhancedServices[serviceId as keyof typeof enhancedServices]
  
  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        const res = await apiFetch<Array<{ key: string; value: any }>>('/settings?category=contact', { method: 'GET' })
        if (Array.isArray(res)) {
          const emailSetting = res.find(s => s.key === 'email')
          if (emailSetting && emailSetting.value) {
            setContactEmail(emailSetting.value)
          }
        }
      } catch (error) {
        // Keep default email if loading fails
      }
    }
    loadContactInfo()
  }, [])
  
  // Extract text values safely
  const serviceTitle = getText(service.title)
  const serviceDescription = getText(service.description)

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8 pt-24">
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary arabic-text">الرئيسية</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-primary arabic-text">الخدمات</Link>
            <span>/</span>
            <span className="text-foreground arabic-text">{serviceTitle}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="animate-fade-in">
              <div className="flex items-center space-x-4 space-x-reverse mb-6">
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${enhancedData?.gradient || 'from-primary/10 to-accent/10'} flex items-center justify-center`}>
                  <Icon className={`h-8 w-8 ${enhancedData?.iconColor || 'text-primary'}`} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-primary arabic-text">
                    {serviceTitle}
                  </h1>
                  <p className="text-lg text-muted-foreground mt-2 arabic-text">
                    {enhancedData?.shortDescription || serviceDescription}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Badge variant="secondary" className="flex items-center space-x-2 space-x-reverse arabic-text">
                  <Clock className="h-4 w-4" />
                  <span>{service.deliveryTime}</span>
                </Badge>
                <Badge variant="outline" className="text-accent border-accent arabic-text">
                  {service.price}
                </Badge>
                <Badge variant="outline" className="arabic-text">
                  {service.revisions}
                </Badge>
              </div>
            </div>

            {/* Description */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-primary mb-4 arabic-text">وصف الخدمة</h2>
                <p className="text-foreground/80 leading-relaxed arabic-text">
                  {enhancedData?.fullDescription || serviceDescription}
                </p>
              </CardContent>
            </Card>

            {/* Scope */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-primary mb-4 arabic-text">نطاق العمل</h2>
                <ul className="space-y-3">
                  {(enhancedData?.scopeItems || [service.scope]).map((item, index) => (
                    <li key={index} className="flex items-start space-x-3 space-x-reverse">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground/80 arabic-text">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Deliverables */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-primary mb-4 arabic-text">ما ستحصل عليه</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(enhancedData?.detailedDeliverables || service.deliverables).map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 space-x-reverse">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                      <span className="text-foreground/80 text-sm arabic-text">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* File Formats */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center space-x-2 space-x-reverse arabic-text">
                  <FileImage className="h-5 w-5" />
                  <span>صيغ الملفات</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(enhancedData?.fileFormats || service.formats.split(', ')).map((format, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      .{format}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Samples */}
            {enhancedData?.samples && (
              <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-primary mb-4 arabic-text">أمثلة من أعمالنا</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enhancedData.samples.map((sample, index) => (
                      <div key={index} className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-border/50">
                        <div className="flex items-center space-x-2 space-x-reverse mb-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium text-foreground arabic-text">نموذج {index + 1}</span>
                        </div>
                        <p className="text-sm text-muted-foreground arabic-text">{sample}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Card */}
            <Card className="sticky top-24 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary mb-2 arabic-text">
                    {service.price}
                  </div>
                  <p className="text-muted-foreground arabic-text">السعر يبدأ من</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground arabic-text">مدة التسليم:</span>
                    <span className="font-medium arabic-text">{service.deliveryTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground arabic-text">التعديلات:</span>
                    <span className="font-medium arabic-text">{service.revisions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground arabic-text">ضمان الجودة:</span>
                    <span className="font-medium text-green-600 arabic-text">متوفر</span>
                  </div>
                </div>

                <Button asChild size="lg" className="w-full bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-primary-foreground font-semibold mb-4 arabic-text">
                  <Link href={`/order/payment?service=${serviceId}`} className="flex items-center justify-center space-x-2 space-x-reverse">
                    <span>اطلب الخدمة الآن</span>
                    <Check className="h-5 w-5 rtl-flip" />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="sm" className="w-full arabic-text">
                  <Link href={`/order/payment?service=${serviceId}`}>ادفع الآن</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
              <CardContent className="p-6">
                <h3 className="font-bold text-primary mb-4 arabic-text">هل تحتاج مساعدة؟</h3>
                <p className="text-sm text-muted-foreground mb-4 arabic-text">
                  فريقنا جاهز للإجابة على استفساراتك وتقديم الاستشارة المجانية
                </p>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground arabic-text">البريد الإلكتروني:</span>
                    <br />
                    <span className="font-medium">{contactEmail}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground arabic-text">الواتساب:</span>
                    <br />
                    <span className="font-medium arabic-text">متوفر للاستشارة المجانية</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
