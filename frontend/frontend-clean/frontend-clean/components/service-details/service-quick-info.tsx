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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="text-center p-4 bg-gradient-to-br from-[#f4f4f6] to-[#bcbcbc]/20 rounded-xl border border-[#bcbcbc]/30">
        <Clock className="h-8 w-8 text-[#4b2e83] mx-auto mb-2" />
        <p className="font-semibold text-[#4b2e83] arabic-text">مدة التنفيذ</p>
        <p className="text-[#7a4db3] arabic-text">{deliveryTime.min}-{deliveryTime.max} أيام</p>
      </div>
      <div className="text-center p-4 bg-gradient-to-br from-[#f4f4f6] to-[#bcbcbc]/20 rounded-xl border border-[#bcbcbc]/30">
        <RefreshCw className="h-8 w-8 text-[#4b2e83] mx-auto mb-2" />
        <p className="font-semibold text-[#4b2e83] arabic-text">التعديلات</p>
        <p className="text-[#7a4db3] arabic-text">{revisions} تعديلات مجانية</p>
      </div>
      <div className="text-center p-4 bg-gradient-to-br from-[#f4f4f6] to-[#bcbcbc]/20 rounded-xl border border-[#bcbcbc]/30">
        <Award className="h-8 w-8 text-[#4b2e83] mx-auto mb-2" />
        <p className="font-semibold text-[#4b2e83] arabic-text">{qualityTitle}</p>
        <p className="text-[#7a4db3] arabic-text">{qualitySubtitle}</p>
      </div>
    </div>
  )
}
