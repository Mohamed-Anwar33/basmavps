import { Card, CardContent } from "@/components/ui/card"
import { Star, Shield, Award, Clock } from "lucide-react"

const values = [
  {
    icon: Star,
    title: "الأصالة",
    description: "نحافظ على الهوية العربية الأصيلة في تصاميمنا مع مواكبة أحدث الاتجاهات العالمية",
  },
  {
    icon: Shield,
    title: "الشفافية",
    description: "نتعامل بشفافية كاملة في جميع مراحل المشروع من التسعير حتى التسليم",
  },
  {
    icon: Award,
    title: "التميّز",
    description: "نسعى للتميز في كل تفصيلة ونقدم أعلى مستويات الجودة في جميع أعمالنا",
  },
  {
    icon: Clock,
    title: "الالتزام",
    description: "نلتزم بالمواعيد المحددة ونحترم وقت عملائنا كما نحترم وقتنا",
  },
]

export function ValuesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground arabic-text">قيمنا</h2>
            <p className="text-lg text-muted-foreground arabic-text max-w-3xl mx-auto">
              القيم التي نؤمن بها وتوجه عملنا في كل مشروع نقوم به
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 border-border/50">
                <CardContent className="p-6 space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground arabic-text">{value.title}</h3>
                  <p className="text-sm text-muted-foreground arabic-text leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
