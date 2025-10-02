import { CheckCircle, Star } from "lucide-react"

interface ServiceFeaturesProps {
  features: string[]
}

export function ServiceFeatures({ features }: ServiceFeaturesProps) {
  if (!features || features.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-lg sm:text-xl font-bold text-[#4b2e83] arabic-text flex items-center gap-2">
        <Star className="h-4 w-4 sm:h-5 sm:w-5 text-[#7a4db3]" />
        مميزات الخدمة
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {features.map((feature: string, i: number) => (
          <div key={i} className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] rounded-lg border border-[#dee2e6] hover:shadow-md transition-all duration-300">
            <div className="flex-shrink-0 mt-0.5">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#7a4db3]" />
            </div>
            <span className="arabic-text text-[#4b2e83] text-sm sm:text-base leading-relaxed text-right">
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
