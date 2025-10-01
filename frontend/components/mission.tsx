import { Card, CardContent } from "@/components/ui/card"
import { Target, Heart, Lightbulb } from "lucide-react"

export function Mission() {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground arabic-text">مهمتنا</h2>
            <p className="text-lg text-muted-foreground arabic-text max-w-3xl mx-auto">
              نسعى لتمكين الأفراد والشركات من التعبير عن هويتهم الفريدة من خلال تصاميم استثنائية تحقق أهدافهم
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-border/50">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground arabic-text">الهدف</h3>
                <p className="text-muted-foreground arabic-text leading-relaxed">
                  تحويل الأفكار إلى تصاميم مؤثرة تحقق النتائج المرجوة وتترك انطباعًا لا يُنسى
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-border/50">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Heart className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground arabic-text">الشغف</h3>
                <p className="text-muted-foreground arabic-text leading-relaxed">
                  نحب ما نفعله ونضع قلوبنا في كل تصميم، لأننا نؤمن بقوة الإبداع في تغيير العالم
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-border/50">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Lightbulb className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground arabic-text">الإبداع</h3>
                <p className="text-muted-foreground arabic-text leading-relaxed">
                  نبتكر حلولاً تصميمية فريدة تعكس شخصية كل عميل وتميزه عن المنافسين
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
