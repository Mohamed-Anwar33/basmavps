import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            <span className="arabic-text">لم نتمكن من العثور على الصفحة</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight arabic-text bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
            عذرًا، هذه الصفحة غير موجودة
          </h1>

          <p className="text-lg text-muted-foreground arabic-text max-w-2xl mx-auto leading-relaxed">
            ربما تم نقل الصفحة أو حذفها، أو ربما كان هناك خطأ في الكتابة. لا تقلق، يمكنك العودة للصفحة الرئيسية أو
            استكشاف خدماتنا.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button size="lg" className="arabic-text bg-primary hover:bg-accent [&>*]:!text-black [&>*>*]:!text-black" asChild>
              <Link href="/" className="flex items-center gap-2" style={{color: '#000 !important'}}>
                <Home className="h-5 w-5" style={{color: '#000 !important'}} />
                <span style={{color: '#000 !important'}}>العودة للصفحة الرئيسية</span>
              </Link>
            </Button>

            <Button size="lg" variant="outline" className="arabic-text border-primary hover:bg-primary [&>*]:!text-black [&>*>*]:!text-black" asChild>
              <Link href="/services" className="flex items-center gap-2" style={{color: '#000 !important'}}>
                <span style={{color: '#000 !important'}}>تصفح خدماتنا</span>
                <ArrowLeft className="h-5 w-5 rtl-flip" style={{color: '#000 !important'}} />
              </Link>
            </Button>

            <Button size="lg" variant="ghost" className="arabic-text hover:bg-primary/10 [&>*]:!text-black [&>*>*]:!text-black" asChild>
              <Link href="/contact" style={{color: '#000 !important'}}>
                <span style={{color: '#000 !important'}}>التواصل مع الدعم</span>
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
            <div className="rounded-xl border bg-card p-5">
              <p className="font-semibold arabic-text">روابط مفيدة</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground arabic-text">
                <li>
                  <Link className="hover:text-primary" href="/faq">الأسئلة الشائعة</Link>
                </li>
                <li>
                  <Link className="hover:text-primary" href="/blog">المدونة</Link>
                </li>
                <li>
                  <Link className="hover:text-primary" href="/contact">تواصل معنا</Link>
                </li>
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <p className="font-semibold arabic-text">قد تبحث عن</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground arabic-text">
                <li>
                  <Link className="hover:text-primary" href="/services/logos">تصميم الشعارات</Link>
                </li>
                <li>
                  <Link className="hover:text-primary" href="/services/social-media">تصاميم السوشيال ميديا</Link>
                </li>
                <li>
                  <Link className="hover:text-primary" href="/services/content-writing">كتابة المحتوى</Link>
                </li>
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <p className="font-semibold arabic-text">هل تحتاج مساعدة؟</p>
              <p className="mt-3 text-sm text-muted-foreground arabic-text">
                تواصل معنا مباشرة وسنساعدك في الوصول لما تبحث عنه.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild className="arabic-text [&>*]:!text-black [&>*>*]:!text-black">
                  <Link href="/contact" style={{color: '#000 !important'}}>
                    <span style={{color: '#000 !important'}}>تواصل معنا</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
