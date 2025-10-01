import { Badge } from "@/components/ui/badge"
import { Download, FileText } from "lucide-react"

interface ServiceDeliveryFormatsProps {
  formats: string[]
}

export function ServiceDeliveryFormats({ formats }: ServiceDeliveryFormatsProps) {
  if (!formats || formats.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-[#4b2e83] arabic-text flex items-center gap-2">
        <Download className="h-5 w-5 text-[#7a4db3]" />
        صيغ التسليم
      </h3>
      <div className="flex flex-wrap gap-2">
        {formats.map((format: string, i: number) => (
          <Badge key={i} variant="outline" className="arabic-text bg-[#f4f4f6] text-[#4b2e83] border-[#bcbcbc]/40 px-3 py-1 hover:bg-[#7a4db3] hover:text-white transition-colors">
            <FileText className="h-3 w-3 ml-1" />
            {format}
          </Badge>
        ))}
      </div>
    </div>
  )
}
