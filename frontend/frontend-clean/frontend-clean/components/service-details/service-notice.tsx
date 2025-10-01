import { Shield, AlertTriangle, MessageCircle } from "lucide-react"

interface ServiceNoticeProps {
  uiTexts?: {
    noticeTitle?: string
    noticePoints?: string[]
  }
}

export function ServiceNotice({ uiTexts }: ServiceNoticeProps) {
  const tNoticeTitle = uiTexts?.noticeTitle || 'تنويه هام'
  const noticeToShow = uiTexts?.noticePoints || []
  
  // إخفاء القسم إذا لم تكن هناك نقاط تنويه
  if (!noticeToShow || noticeToShow.length === 0) {
    return null
  }
  const icons = [AlertTriangle, MessageCircle]

  return (
    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border border-red-200">
      <h3 className="text-lg font-bold text-red-800 arabic-text flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5" />
        {tNoticeTitle}
      </h3>
      <div className="space-y-3 text-red-700 arabic-text">
        {noticeToShow.map((line, idx) => {
          const IconComponent = icons[idx] || AlertTriangle
          return (
            <p key={idx} className="flex items-start gap-3">
              <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {line}
            </p>
          )
        })}
      </div>
    </div>
  )
}
