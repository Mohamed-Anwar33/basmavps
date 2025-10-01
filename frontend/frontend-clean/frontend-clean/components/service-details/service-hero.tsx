import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, RefreshCw, Award } from "lucide-react"
import Link from "next/link"
import { ServiceQuickInfo } from "./service-quick-info"

interface ServiceHeroProps {
  title: string
  description: string
  shortDescription: string
  category: string
  deliveryTime: { min: number; max: number }
  revisions: number
  IconComponent: any
  categoryStyle: { iconColor: string; bgGradient: string }
  uiTexts?: {
    qualityTitle?: string
    qualitySubtitle?: string
  }
}

export function ServiceHero({
  title,
  description,
  shortDescription,
  category,
  deliveryTime,
  revisions,
  IconComponent,
  categoryStyle,
  uiTexts
}: ServiceHeroProps) {
  const tQualityTitle = uiTexts?.qualityTitle || 'جودة احترافية'
  const tQualitySubtitle = uiTexts?.qualitySubtitle || 'بصمة إبداعية مميزة'

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-[#f4f4f6]/50">
        <CardHeader className="bg-gradient-to-r from-[#4b2e83] to-[#7a4db3] text-white p-6 md:p-8">
          <div className="flex flex-col-reverse md:flex-row md:items-center gap-4 md:gap-6 mb-3 md:mb-4 text-center md:text-right">
            <div>
              <Badge className="bg-white/20 text-white border-white/30 mb-2 mx-auto md:mx-0">
                خدمة احترافية
              </Badge>
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold arabic-text leading-snug">
                {title}
              </CardTitle>
            </div>
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full ring-1 ring-white/30 shadow-sm flex items-center justify-center bg-gradient-to-br from-[#f4f4f6] to-white mx-auto md:mx-0`}>
              <IconComponent className={`h-6 w-6 md:h-8 md:w-8 text-[#4b2e83]`} />
            </div>
          </div>
          <p className="max-w-2xl mx-auto md:mx-0 text-base md:text-lg text-white/90 arabic-text leading-relaxed">
            {shortDescription}
          </p>
        </CardHeader>
      </Card>
      
      {/* Service Quick Info with elegant icons */}
      <ServiceQuickInfo
        deliveryTime={deliveryTime}
        revisions={revisions}
        qualityTitle={tQualityTitle}
        qualitySubtitle={tQualitySubtitle}
      />
    </div>
  )
}
