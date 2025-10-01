import { Package, Sparkles, RefreshCw, AlertTriangle } from "lucide-react"

interface ServiceDetailsSectionProps {
  title?: string
  details?: string[]
  uiTexts?: {
    detailsTitle?: string
    detailsPoints?: string[]
  }
}

export function ServiceDetailsSection({ title, details, uiTexts }: ServiceDetailsSectionProps) {
  const tDetailsTitle = uiTexts?.detailsTitle || title || 'تفاصيل الخدمة'
  
  // استخدام البيانات الحقيقية من قاعدة البيانات أولاً
  const detailsToShow = uiTexts?.detailsPoints && uiTexts.detailsPoints.length > 0 
    ? uiTexts.detailsPoints 
    : (details && details.length > 0 ? details : [])
  
  // إخفاء القسم إذا لم تكن هناك بيانات
  if (!detailsToShow || detailsToShow.length === 0) {
    return null
  }
  
  const icons = [Sparkles, RefreshCw, AlertTriangle]

  return (
    <div id="details" className="space-y-6 bg-gradient-to-r from-[#f4f4f6] to-[#bcbcbc]/10 p-6 rounded-xl border border-[#bcbcbc]/30">
      <h3 className="text-xl font-bold text-[#4b2e83] arabic-text flex items-center gap-2">
        <Package className="h-5 w-5" />
        {tDetailsTitle}
      </h3>
      
      <div className="space-y-5 text-[#4b2e83] arabic-text">
        {detailsToShow.map((line, idx) => {
          const IconComponent = icons[idx] || Sparkles
          return (
            <div key={idx} className="flex items-start gap-3">
              <IconComponent className="h-5 w-5 text-[#7a4db3] mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">{line}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
