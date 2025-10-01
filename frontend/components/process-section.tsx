import { Card, CardContent } from "@/components/ui/card"
import { Ear, Palette, Eye, Truck } from "lucide-react"

const processSteps = [
  {
    icon: Ear,
    title: "الاستماع",
    description: "نستمع بعناية لأفكارك ومتطلباتك لفهم رؤيتك بشكل كامل",
    step: "01",
  },
  {
    icon: Palette,
    title: "التصميم",
    description: "نحول أفكارك إلى تصاميم إبداعية تعكس هويتك وتحقق أهدافك",
    step: "02",
  },
  {
    icon: Eye,
    title: "المراجعة",
    description: "نراجع التصميم معك ونجري التعديلات اللازمة حتى نصل للنتيجة المثالية",
    step: "03",
  },
  {
    icon: Truck,
    title: "التسليم",
    description: "نسلم المشروع في الوقت المحدد بأعلى جودة وجميع الملفات المطلوبة",
    step: "04",
  },
]

export function ProcessSection() {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground arabic-text">عمليتنا</h2>
            <p className="text-lg text-muted-foreground arabic-text max-w-3xl mx-auto">
              نتبع منهجية واضحة ومدروسة لضمان تحقيق أفضل النتائج في كل مشروع
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <Card
                key={index}
                className="relative text-center hover:shadow-lg transition-all duration-300 border-border/50"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="absolute -top-4 right-4 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mt-4">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground arabic-text">{step.title}</h3>
                  <p className="text-sm text-muted-foreground arabic-text leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
