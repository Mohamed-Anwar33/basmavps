import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageCircle } from "lucide-react"
import Link from "next/link"

export function AboutCTA() {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground arabic-text text-balance">
            مستعد لبدء مشروعك معنا؟
          </h2>
          <p className="text-lg text-muted-foreground arabic-text max-w-2xl mx-auto">
            دعنا نساعدك في تحويل أفكارك إلى تصاميم استثنائية تحقق أهدافك وتترك أثرًا إيجابيًا
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-accent text-primary-foreground font-semibold text-lg px-8 py-6 arabic-text group"
              asChild
            >
              <Link href="/contact" className="flex items-center gap-2">
                تواصل معنا
                <ArrowLeft className="h-5 w-5 rtl-flip group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="font-semibold text-lg px-8 py-6 arabic-text border-primary text-primary hover:bg-primary hover:text-primary-foreground group bg-transparent"
              asChild
            >
              <Link href="/contact" className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                تواصل معنا
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
