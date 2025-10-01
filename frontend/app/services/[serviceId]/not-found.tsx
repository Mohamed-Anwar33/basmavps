import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen py-20 pt-32">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="p-8">
            <CardContent className="space-y-6">
              <div className="w-24 h-24 mx-auto mb-6 bg-muted/20 rounded-full flex items-center justify-center">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-primary mb-4 arabic-text">
                  الخدمة غير موجودة
                </h1>
                <p className="text-lg text-muted-foreground mb-6 arabic-text">
                  عذراً، لم نتمكن من العثور على الخدمة التي تبحث عنها. قد تكون الخدمة غير متاحة أو تم نقلها.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-primary hover:bg-accent text-primary-foreground font-medium arabic-text">
                  <Link href="/services" className="flex items-center gap-2">
                    <ArrowLeft className="h-5 w-5 rtl-flip" />
                    تصفح جميع الخدمات
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg" className="arabic-text">
                  <Link href="/">العودة للرئيسية</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}