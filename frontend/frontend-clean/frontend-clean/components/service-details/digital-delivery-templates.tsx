import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DigitalDeliveryTemplatesProps {
  digitalDelivery?: {
    type: 'links'
    links: Array<{
      title?: string
      url: string
      imageUrl?: string
      locale?: 'ar' | 'en' | 'mixed'
      tags?: string[]
    }>
  }
}

export function DigitalDeliveryTemplates({ digitalDelivery }: DigitalDeliveryTemplatesProps) {
  if (!digitalDelivery || digitalDelivery.type !== 'links' || !digitalDelivery.links?.length) {
    return null
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-[#f4f4f6] to-[#bcbcbc]/10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold arabic-text text-[#4b2e83] flex items-center gap-2">
          قوالب جاهزة للتعديل عبر Canva
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {digitalDelivery.links.map((l, idx) => (
            <a key={idx} href={l.url} target="_blank" rel="noopener noreferrer" className="group block">
              <div className="overflow-hidden rounded-xl border border-[#bcbcbc]/30 bg-white shadow-sm hover:shadow-md transition-all hover:border-[#7a4db3]/50">
                <div className="aspect-video w-full overflow-hidden">
                  {l.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.imageUrl} alt={l.title || 'قالب سيرة'} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#f4f4f6] to-[#bcbcbc]/20 flex items-center justify-center text-[#4b2e83] font-extrabold text-3xl">CV</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="font-bold text-[#4b2e83] arabic-text line-clamp-1">{l.title || 'قالب سيرة'}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#bcbcbc]/30 text-[#7a4db3] bg-[#f4f4f6]">
                      {l.locale === 'ar' ? 'AR' : l.locale === 'en' ? 'EN' : '—'}
                    </span>
                  </div>
                  {Array.isArray(l.tags) && l.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {l.tags.map((t, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#7a4db3]/10 text-[#7a4db3] border border-[#7a4db3]/20">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
        <p className="text-sm text-[#bcbcbc] arabic-text mt-3">اضغط على أي بطاقة لفتح القالب والبدء في التعديل مباشرة.</p>
      </CardContent>
    </Card>
  )
}
