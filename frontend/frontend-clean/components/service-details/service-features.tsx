import { CheckCircle, Star } from "lucide-react"

interface ServiceFeaturesProps {
  features: string[]
}

export function ServiceFeatures({ features }: ServiceFeaturesProps) {
  if (!features || features.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-[#4b2e83] arabic-text flex items-center gap-2">
        <Star className="h-5 w-5 text-[#7a4db3]" />
        مميزات الخدمة
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {features.map((feature: string, i: number) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#f4f4f6] to-[#bcbcbc]/10 rounded-lg border border-[#bcbcbc]/20">
            <CheckCircle className="h-5 w-5 text-[#7a4db3] flex-shrink-0" />
            <span className="arabic-text text-[#4b2e83]">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
