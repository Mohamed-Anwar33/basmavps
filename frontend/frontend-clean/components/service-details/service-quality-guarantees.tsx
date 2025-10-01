import { Shield, CircleCheckBig } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ServiceQualityGuaranteesProps {
  uiTexts?: {
    qualityTitle?: string
    qualitySubtitle?: string
    qualityPoints?: string[]
  }
}

export function ServiceQualityGuarantees({ uiTexts }: ServiceQualityGuaranteesProps) {
  const qualityTitle = uiTexts?.qualityTitle || 'ضمانات الجودة'
  const qualitySubtitle = uiTexts?.qualitySubtitle || 'جودة احترافية مضمونة'
  const qualityPoints = uiTexts?.qualityPoints || []

  // إخفاء القسم إذا لم تكن هناك نقاط جودة
  if (!qualityPoints || qualityPoints.length === 0) {
    return null
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <h3 className="font-bold text-[#4b2e83] arabic-text mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {qualityTitle}
        </h3>
        <div className="space-y-3 text-sm">
          {qualityPoints.map((point, index) => (
            <div key={index} className="flex items-center gap-2 text-[#4b2e83]">
              <CircleCheckBig className="h-4 w-4 text-[#7a4db3]" />
              <span className="arabic-text">{point}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
