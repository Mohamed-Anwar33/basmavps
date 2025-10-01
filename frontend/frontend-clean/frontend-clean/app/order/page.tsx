"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { apiFetch, getToken } from "@/lib/api"
import { useToastContext } from "@/contexts/toast-context"

export default function OrderPage() {
  const sp = useSearchParams()
  const [contactCfg, setContactCfg] = useState<Record<string, any> | null>(null)
  const [authorized, setAuthorized] = useState<boolean>(false)
  const { toast } = useToastContext()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch<Array<{ key: string; value: any }>>('/settings?category=contact', { method: 'GET' })
        if (Array.isArray(res)) {
          const map: Record<string, any> = {}
          res.forEach((s) => { map[s.key] = s.value })
          setContactCfg(map)
        }
      } catch {}
    }
    load()
  }, [])

  // Auth gate: require login to start order
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setAuthorized(false)
      toast({ title: 'تسجيل الدخول مطلوب', description: 'يرجى تسجيل الدخول قبل بدء طلب خدمة.', variant: 'warning' })
    } else {
      setAuthorized(true)
    }
  }, [toast])

  const whatsappLink = contactCfg?.whatsappLink || '#'
  const postPaymentMessage = contactCfg?.postPaymentMessage || 'للتأكيد وبدء التنفيذ، يرجى التواصل معنا عبر واتساب وذكر رقم الطلب أو البريد الإلكتروني المستخدم في الدفع'

  const targetService = sp.get('service')
  const paymentHref = `/order/payment${targetService ? `?service=${encodeURIComponent(targetService)}` : ''}`
  const ctaHref = authorized ? paymentHref : "/login"

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Title */}
      <section className="pt-32 pb-10 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary arabic-text">صفحة طلب خدمة – بصمة تصميم</h1>
        </div>
      </section>

      {/* Simple intro */}
      <section className="py-12 relative z-30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-primary arabic-text mb-6">ابدأ طلبك الآن</h2>
            <p className="text-lg text-muted-foreground arabic-text mb-8">
              اختر الخدمة التي تحتاجها وأكمل الطلب في خطوات بسيطة
            </p>
            {!authorized && (
              <Card className="bg-red-50 border-red-200 mb-8 relative z-30">
                <CardContent className="p-6 arabic-text text-red-900">
                  <p className="font-bold mb-2">تسجيل الدخول مطلوب</p>
                  <p className="mb-4">يجب تسجيل الدخول قبل البدء في طلب خدمة.</p>
                  <a href="/login" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 relative z-30 hover:bg-primary/90 transition-colors">تسجيل الدخول</a>
                </CardContent>
              </Card>
            )}
            <p className="text-muted-foreground arabic-text">
              تحتاج مساعدة في فهم عملية الطلب؟ <a href="/how-to-order" className="text-primary underline relative z-30">اقرأ دليل الطلب الشامل</a>
            </p>
          </div>
        </div>
      </section>

      {/* Direct Order Button */}
      <section className="py-12 relative z-30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border-primary/30 relative z-30">
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold arabic-text mb-4 text-primary">ابدأ طلبك الآن</h3>
                <p className="text-muted-foreground arabic-text mb-6">املأ بياناتك وتفاصيل طلبك وأكمل الدفع في خطوات بسيطة</p>
                <Link
                  href={ctaHref}
                  className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-8 py-3 text-lg font-semibold arabic-text relative z-30 hover:bg-primary/90 transition-colors"
                >
                  {authorized ? 'ابدأ الطلب والدفع' : 'سجّل الدخول للبدء'}
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
