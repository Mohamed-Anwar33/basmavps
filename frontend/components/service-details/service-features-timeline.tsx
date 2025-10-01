import { CheckCircle, Star, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ServiceFeaturesTimelineProps {
  features: string[]
}

export function ServiceFeaturesTimeline({ features }: ServiceFeaturesTimelineProps) {
  if (!features || features.length === 0) return null

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white arabic-text mb-12 bg-[#4B2E83] px-6 py-3 rounded-lg inline-block">
        مميزات الخدمة
      </h2>
      
      {/* Timeline Container */}
      <div className="relative">
        {/* Main Timeline Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7a4db3] via-[#7a4db3] to-[#7a4db3] transform -translate-y-1/2 z-0"></div>
        
        {/* Features Timeline */}
        <div className="relative z-10 flex justify-between items-center min-h-[200px]">
          {features.map((feature: string, index: number) => {
            const isEven = index % 2 === 0
            const isLast = index === features.length - 1
            
            return (
              <div key={index} className="flex-1 relative">
                {/* Timeline Node */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="w-4 h-4 bg-[#7a4db3] rounded-full border-4 border-white shadow-lg"></div>
                </div>
                
                {/* Feature Card */}
                <div className={cn(
                  "absolute left-1/2 transform -translate-x-1/2 w-full max-w-[200px] px-4",
                  isEven ? "bottom-[60%] mb-4" : "top-[60%] mt-4"
                )}>
                  {/* Arrow pointing to timeline */}
                  <div className={cn(
                    "absolute left-1/2 transform -translate-x-1/2 w-0 h-0",
                    isEven 
                      ? "top-full border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-[#7a4db3]"
                      : "bottom-full border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-[#7a4db3]"
                  )}></div>
                  
                  {/* Feature Content */}
                  <div className="bg-gradient-to-br from-[#7a4db3] to-[#4b2e83] text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-start gap-2 text-center">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-white/90" />
                      <span className="arabic-text text-sm font-medium leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Connection Line to Next Feature (except for last item) */}
                {!isLast && (
                  <div className="absolute left-1/2 top-1/2 w-full h-0.5 bg-[#7a4db3] transform -translate-y-1/2 z-0">
                    <ArrowRight className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 h-3 w-3 text-[#7a4db3]" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Mobile Responsive: Stack vertically on small screens */}
      <div className="md:hidden space-y-4">
        {features.map((feature: string, index: number) => (
          <div key={`mobile-${index}`} className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#7a4db3] to-[#4b2e83] text-white rounded-lg shadow-lg">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span className="arabic-text font-medium">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
