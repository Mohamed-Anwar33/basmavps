"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search } from "lucide-react"

const faqs = [
  {
    id: "delivery-time",
    question: "كم يستغرق تسليم التصميم؟",
    answer:
      "يختلف وقت التسليم حسب نوع الخدمة. تصاميم السوشيال ميديا تستغرق 3-5 أيام، البنرات 2-3 أيام، الشعارات 5-7 أيام، والسير الذاتية 1-2 أيام. نلتزم بالمواعيد المحددة ونبلغك بأي تأخير محتمل مسبقاً.",
    category: "التسليم",
  },
  {
    id: "revisions",
    question: "كم عدد المراجعات المسموحة؟",
    answer:
      "نقدم مراجعات مجانية حسب نوع الخدمة: 3 مراجعات للسوشيال ميديا، 2 مراجعات للبنرات، 3 مراجعات للشعارات. المراجعات الإضافية متاحة برسوم إضافية.",
    category: "المراجعات",
  },
  {
    id: "payment-methods",
    question: "ما هي طرق الدفع المتاحة؟",
    answer:
      "نقبل الدفع عبر PayPal بجميع البطاقات الائتمانية والخصم. الدفع آمن ومحمي بأعلى معايير الأمان. جميع المدفوعات غير قابلة للاسترداد.",
    category: "الدفع",
  },
  {
    id: "file-formats",
    question: "ما هي صيغ الملفات التي أحصل عليها؟",
    answer:
      "تحصل على ملفات عالية الجودة بصيغ متعددة: PNG وJPG للاستخدام العام، PSD للتعديل، AI للشعارات، وأحجام متعددة مناسبة للمنصات المختلفة.",
    category: "الملفات",
  },
  {
    id: "refund-policy",
    question: "هل يمكنني استرداد المبلغ؟",
    answer:
      "جميع المدفوعات غير قابلة للاسترداد وفقاً لسياستنا. نضمن جودة العمل والالتزام بالمتطلبات المتفق عليها. في حالة عدم الرضا، نعمل معك على التعديلات اللازمة.",
    category: "السياسات",
  },
  {
    id: "rush-orders",
    question: "هل تقدمون خدمة التسليم السريع؟",
    answer:
      "نعم، نقدم خدمة التسليم السريع مقابل رسوم إضافية 50% من قيمة الخدمة. يمكن تسليم معظم التصاميم خلال 24-48 ساعة حسب التعقيد.",
    category: "التسليم",
  },
  {
    id: "copyright",
    question: "من يملك حقوق التصميم؟",
    answer:
      "بعد الدفع الكامل، تنتقل جميع حقوق التصميم إليك. يمكنك استخدام التصميم تجارياً دون قيود. نحتفظ بحق عرض العمل في معرض أعمالنا ما لم تطلب خلاف ذلك.",
    category: "الحقوق",
  },
  {
    id: "communication",
    question: "كيف يتم التواصل أثناء المشروع؟",
    answer:
      "نتواصل معك عبر واتساب أو البريد الإلكتروني حسب تفضيلك. نرسل تحديثات منتظمة ونطلب موافقتك في كل مرحلة مهمة من المشروع.",
    category: "التواصل",
  },
]

const categories = ["الكل", "التسليم", "المراجعات", "الدفع", "الملفات", "السياسات", "الحقوق", "التواصل"]

export function FAQSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("الكل")

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "الكل" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Search and Filter */}
          <div className="mb-12 space-y-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="ابحث في الأسئلة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 arabic-text"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors arabic-text ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {filteredFAQs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-6">
                <AccordionTrigger className="text-right arabic-text font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground arabic-text leading-relaxed pt-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground arabic-text">لم يتم العثور على أسئلة تطابق البحث</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
