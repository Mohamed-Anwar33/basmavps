"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { apiFetch, getToken } from "@/lib/api"
import { OrderFlowStandalone, StandaloneOrderData } from "@/components/order-flow-standalone"
import { useToastContext } from "@/contexts/toast-context"

export default function OrderPaymentPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const [contactCfg, setContactCfg] = useState<Record<string, any> | null>(null)
  const [initialData, setInitialData] = useState<Partial<StandaloneOrderData>>({})
  const [authorized, setAuthorized] = useState<boolean>(false)
  const { toast } = useToastContext()

  // Auth gate: require login for payment
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setAuthorized(false)
      toast({ title: "تسجيل الدخول مطلوب", description: "يرجى تسجيل الدخول لإتمام طلب الخدمة.", variant: "warning" })
    } else {
      setAuthorized(true)
    }
  }, [toast])

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

  // Load draft from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("orderDraft")
      if (raw) {
        const parsed = JSON.parse(raw)
        setInitialData(parsed)
      }
    } catch {}
  }, [])

  const whatsappLink = contactCfg?.whatsappLink || '#'
  const postPaymentMessage = contactCfg?.postPaymentMessage || 'للتأكيد وبدء التنفيذ، يرجى التواصل معنا عبر واتساب وذكر رقم الطلب أو البريد الإلكتروني المستخدم في الدفع'

  const defaultServiceId = useMemo(() => {
    const serviceFromUrl = sp.get('service')
    const serviceFromStorage = initialData.service as string | undefined
    
    // Check localStorage for recently selected service as backup
    let serviceFromLocalStorage: string | undefined
    try {
      const stored = localStorage.getItem('selectedService')
      if (stored) {
        const parsed = JSON.parse(stored)
        serviceFromLocalStorage = parsed.id
      }
    } catch (e) {
    }
    
    const finalServiceId = serviceFromUrl || serviceFromStorage || serviceFromLocalStorage
    return finalServiceId
  }, [sp, initialData.service])

  const qpHasService = !!sp.get('service')
  const hasDraft = qpHasService || !!(initialData && (initialData.name || initialData.description || initialData.service))

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-10 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary arabic-text">الدفع – بصمة تصميم</h1>
          <p className="mt-3 text-muted-foreground arabic-text">راجع طلبك وأكمل الدفع</p>
        </div>
      </section>

      {(!authorized) && (
        <section className="py-6">
          <div className="container mx-auto px-4">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6 arabic-text text-red-900">
                <p className="font-bold mb-2">غير مسموح</p>
                <p className="mb-4">يجب تسجيل الدخول أولاً قبل طلب أي خدمة أو إتمام الدفع.</p>
                <a href="/login" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2">تسجيل الدخول</a>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {!hasDraft && authorized && (
        <section className="py-6">
          <div className="container mx-auto px-4">
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-6 arabic-text text-amber-900">
                لم نعثر على مسودة طلب في جهازك. يرجى البدء من صفحة "طلب خدمة" أولاً لتعبئة التفاصيل، ثم العودة هنا لإتمام الدفع.
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {authorized && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <OrderFlowStandalone
              mode="full"
              initialStep="contact"
              initialData={initialData}
              defaultServiceId={defaultServiceId}
              lockServiceSelection={qpHasService}
              whatsappLink={whatsappLink}
              postPaymentMessage={postPaymentMessage}
            />
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
