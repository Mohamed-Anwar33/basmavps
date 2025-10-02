import { Clock, RefreshCw, Award } from "lucide-react"

interface ServiceQuickInfoProps {
  deliveryTime: { min: number; max: number }
  revisions: number
  qualityTitle?: string
  qualitySubtitle?: string
}

export function ServiceQuickInfo({
  deliveryTime,
  revisions,
  qualityTitle = 'جودة احترافية',
  qualitySubtitle = 'بصمة إبداعية مميزة'
}: ServiceQuickInfoProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] rounded-xl border border-[#dee2e6] hover:shadow-md transition-all duration-300">
        <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-[#4b2e83] mx-auto mb-2" />
        <p className="font-semibold text-[#4b2e83] arabic-text text-sm sm:text-base">مدة التنفيذ</p>
        <p className="text-[#7a4db3] arabic-text text-xs sm:text-sm">
          {deliveryTime.min === deliveryTime.max 
            ? `${deliveryTime.min} ${deliveryTime.min === 1 ? 'يوم' : 'أيام'}`
            : `${deliveryTime.min}-${deliveryTime.max} أيام`
          }
        </p>
      </div>
      <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] rounded-xl border border-[#dee2e6] hover:shadow-md transition-all duration-300">
        <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 text-[#4b2e83] mx-auto mb-2" />
        <p className="font-semibold text-[#4b2e83] arabic-text text-sm sm:text-base">التعديلات</p>
        <p className="text-[#7a4db3] arabic-text text-xs sm:text-sm">{revisions} تعديلات مجانية</p>
      </div>
      <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] rounded-xl border border-[#dee2e6] hover:shadow-md transition-all duration-300">
        <Award className="h-6 w-6 sm:h-8 sm:w-8 text-[#4b2e83] mx-auto mb-2" />
        <p className="font-semibold text-[#4b2e83] arabic-text text-sm sm:text-base">{qualityTitle}</p>
        <p className="text-[#7a4db3] arabic-text text-xs sm:text-sm">{qualitySubtitle}</p>
      </div>
    </div>
  )
}
