import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, MessageCircle, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"
import { PriceDisplay } from "@/components/price-display"

interface ServiceSidebarProps {
  price: {
    amount: number
    currency: string
    originalAmount?: number
    originalCurrency?: string
  }
  deliveryTime: { min: number; max: number }
  revisions: number
  nonRefundable: boolean
  serviceId: string
  uiTexts?: {
    qualityTitle?: string
    qualityPoints?: string[]
  }
}

export function ServiceSidebar({
  price,
  deliveryTime,
  revisions,
  nonRefundable,
  serviceId,
  uiTexts
}: ServiceSidebarProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="lg:sticky lg:top-24 border-[#bcbcbc]/20 shadow-lg bg-gradient-to-br from-white to-[#f8f9fa]">
        <CardContent className="p-4 sm:p-6">
          <div className="text-center mb-6">
            {/* عرض نسبة الخصم إذا كان هناك سعر أصلي */}
            {price.originalAmount && price.originalAmount > price.amount && (
              <div className="mb-3">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
                  <span className="text-lg">🔥</span>
                  <span className="font-bold text-lg">
                    خصم {Math.round(((price.originalAmount - price.amount) / price.originalAmount) * 100)}%
                  </span>
                  <span className="text-lg">🔥</span>
                </div>
              </div>
            )}
            
            <div className="text-2xl sm:text-3xl font-bold text-[#4b2e83] mb-2 arabic-text">
              <PriceDisplay 
                price={price}
                currentClassName="text-[#4b2e83] font-bold"
                originalClassName="text-gray-400 text-base sm:text-lg line-through mr-2"
              />
            </div>
            <p className="text-[#bcbcbc] arabic-text text-sm sm:text-base">السعر يبدأ من</p>
          </div>
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#bcbcbc] arabic-text">سياسة الاسترجاع:</span>
              <span className="font-medium arabic-text text-[#4b2e83]">{nonRefundable ? 'غير قابلة للاسترجاع' : 'قابلة للاسترجاع'}</span>
            </div>
          </div>
          <Button asChild size="lg" className="w-full bg-gradient-to-r from-[#4b2e83] to-[#7a4db3] hover:from-[#7a4db3] hover:to-[#4b2e83] text-white font-semibold mb-3 sm:mb-4 arabic-text shadow-lg hover:shadow-xl transition-all text-sm sm:text-base py-3 sm:py-4">
            <Link href={`/order/payment?service=${serviceId}`} className="flex items-center justify-center gap-2">
              <span>اطلب الخدمة الآن</span>
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 rtl-flip" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full arabic-text border-[#4b2e83] text-[#4b2e83] hover:bg-[#4b2e83] hover:text-white transition-colors text-xs sm:text-sm py-2 sm:py-3">
            <Link href="/services">تصفح خدمات أخرى</Link>
          </Button>
          
          {/* Contact Info */}
          <div className="mt-6 p-4 bg-gradient-to-br from-[#f4f4f6] to-[#bcbcbc]/10 rounded-lg border border-[#bcbcbc]/20">
            <div className="flex items-center gap-3 text-[#4b2e83]">
              <MessageCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold arabic-text">تواصل معنا</p>
                <p className="text-sm arabic-text">للاستفسارات والدعم الفني</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Trust Indicators */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-[#f4f4f6] to-[#bcbcbc]/10">
        <CardContent className="p-6">
          <h3 className="font-bold text-[#4b2e83] arabic-text mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {uiTexts?.qualityTitle || 'ضمانات الجودة'}
          </h3>
          <div className="space-y-3 text-sm">
            {(uiTexts?.qualityPoints || [
              'جودة احترافية مضمونة',
              'تسليم في الوقت المحدد',
              'دعم فني متواصل',
              'تعديلات مجانية'
            ]).map((point, index) => (
              <div key={index} className="flex items-center gap-2 text-[#4b2e83]">
                <CheckCircle className="h-4 w-4 text-[#7a4db3]" />
                <span className="arabic-text">{point}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
