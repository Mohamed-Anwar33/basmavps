import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, FileText, CreditCard, RefreshCw } from "lucide-react"

const policies = [
  {
    id: "refund-policy",
    title: "سياسة عدم الاسترداد",
    icon: CreditCard,
    content: `
      <p>جميع المدفوعات المقدمة لبصمة تصميم غير قابلة للاسترداد تحت أي ظرف من الظروف. هذه السياسة تطبق على:</p>
      <ul>
        <li>جميع الخدمات المقدمة (تصميم، كتابة محتوى، إلخ)</li>
        <li>الدفعات المقدمة والدفعات الكاملة</li>
        <li>الخدمات المكتملة والغير مكتملة</li>
        <li>حالات عدم الرضا عن النتيجة النهائية</li>
      </ul>
      <p>نلتزم بتقديم خدمة عالية الجودة وفقاً للمتطلبات المتفق عليها. في حالة وجود مشاكل، نعمل على حلها من خلال المراجعات المجانية المتاحة.</p>
    `,
  },
  {
    id: "service-terms",
    title: "شروط الخدمة",
    icon: FileText,
    content: `
      <p>باستخدام خدمات بصمة تصميم، فإنك توافق على الشروط التالية:</p>
      <ul>
        <li>تقديم معلومات دقيقة وكاملة عن متطلبات المشروع</li>
        <li>الرد على الاستفسارات خلال 48 ساعة لتجنب تأخير المشروع</li>
        <li>احترام حقوق الملكية الفكرية للآخرين</li>
        <li>عدم طلب تصاميم تنتهك القوانين أو الأخلاق</li>
        <li>الدفع الكامل قبل تسليم الملفات النهائية</li>
      </ul>
      <p>نحتفظ بالحق في رفض أي مشروع لا يتماشى مع قيمنا أو معاييرنا المهنية.</p>
    `,
  },
  {
    id: "revision-policy",
    title: "سياسة المراجعات",
    icon: RefreshCw,
    content: `
      <p>نقدم مراجعات مجانية محدودة لكل خدمة:</p>
      <ul>
        <li>تصاميم السوشيال ميديا: 3 مراجعات مجانية</li>
        <li>تصاميم البنرات: 2 مراجعات مجانية</li>
        <li>الشعارات: 3 مراجعات مجانية</li>
        <li>السير الذاتية: 2 مراجعات مجانية</li>
        <li>كتابة المحتوى: 2 مراجعات مجانية</li>
      </ul>
      <p>المراجعات الإضافية متاحة برسوم إضافية. يجب طلب المراجعات خلال 7 أيام من التسليم الأولي.</p>
    `,
  },
  {
    id: "privacy-policy",
    title: "سياسة الخصوصية",
    icon: Shield,
    content: `
      <p>نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية:</p>
      <ul>
        <li>لا نشارك معلوماتك الشخصية مع أطراف ثالثة</li>
        <li>نستخدم معلوماتك فقط لتقديم الخدمة المطلوبة</li>
        <li>نحتفظ بملفات المشروع لمدة 30 يوماً بعد التسليم</li>
        <li>يمكنك طلب حذف بياناتك في أي وقت</li>
        <li>نستخدم تشفير SSL لحماية المعاملات المالية</li>
      </ul>
      <p>للاستفسارات حول الخصوصية، تواصل معنا عبر إيميل الشركة</p>
    `,
  },
]

export function PoliciesSection() {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground arabic-text">السياسات والشروط</h2>
            <p className="text-lg text-muted-foreground arabic-text max-w-3xl mx-auto">
              اقرأ سياساتنا وشروط الخدمة بعناية قبل البدء في مشروعك
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {policies.map((policy) => (
              <Card key={policy.id} className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 arabic-text">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <policy.icon className="h-5 w-5 text-primary" />
                    </div>
                    {policy.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none arabic-text text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: policy.content }}
                    style={{
                      direction: "rtl",
                      textAlign: "right",
                      lineHeight: "1.6",
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
