"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { apiFetch } from "@/lib/api"

export default function OrderSuccessPage() {
  const sp = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [showWhatsAppMessage, setShowWhatsAppMessage] = useState(false)
  const [whatsAppLink, setWhatsAppLink] = useState<string>('')

  // Load WhatsApp settings using same endpoint as contact page
  useEffect(() => {
    const loadWhatsAppSettings = async () => {
      try {
        const res = await apiFetch('/contact-page', { method: 'GET' }) as any
        // Contact page response loaded
        
        if (res?.success && res.data) {
          const d = res.data
          let whatsappLink = ''
          
          // Check if API returns flat structure
          if (d.whatsappLink) {
            whatsappLink = (d.whatsappLink ?? '').toString().trim()
          } else if (d.contactInfo?.whatsappLink) {
            // Check nested structure
            whatsappLink = (d.contactInfo?.whatsappLink ?? '').toString().trim()
          }
          
          // WhatsApp link found
          
          const isValidWhats = (url: string) => {
            if (!url) return false
            const u = String(url).trim()
            if (!u || u === '#') return false
            if (u.toLowerCase().includes('your-number')) return false
            return true
          }
          
          if (isValidWhats(whatsappLink)) {
            setWhatsAppLink(whatsappLink)
            // WhatsApp link configured
          } else {
            // Using fallback contact
            setWhatsAppLink('') // Don't set fallback, let it show contact page
          }
        } else {
          // No contact page data found
          setWhatsAppLink('')
        }
      } catch (error) {
        setWhatsAppLink('')
      }
    }
    loadWhatsAppSettings()
  }, [])

  useEffect(() => {
    // PayPal sends 'token' parameter, Stripe sends 'session_id'
    const sessionId = sp.get('session_id') || sp.get('token')
    const provider = sp.get('provider') || 'stripe'
    
    if (!sessionId) {
      setError('Session ID غير موجود')
      setLoading(false)
      return
    }
    const run = async () => {
      try {
        setLoading(true)
        const res: any = await apiFetch('/payment/verify', { method: 'POST', body: JSON.stringify({ sessionId }) })
        setData(res?.data || res)
      } catch (e: any) {
        setError(e?.message || 'تعذر التحقق من حالة الدفع')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [sp])

  // Auto-poll while waiting for PayPal webhook to confirm the payment
  // Keep polling until BOTH payment is succeeded AND orderNumber is available
  useEffect(() => {
    const sessionId = sp.get('session_id') || sp.get('token')
    if (!sessionId) return
    if (!data?.payment?.status) return

    // Poll if payment is pending OR if payment succeeded but no orderNumber yet
    const shouldPoll = data.payment.status === 'pending_webhook_verification' || 
                      (data.payment.status === 'succeeded' && !data?.order?.orderNumber)
    if (!shouldPoll) return

    let cancelled = false
    let attempt = 0
    const delaysMs = [3000, 5000, 8000, 12000, 18000, 25000] // ~2 minutes max with faster start

    const poll = async () => {
      if (cancelled) return
      const delay = delaysMs[Math.min(attempt, delaysMs.length - 1)]
      try {
        const res: any = await apiFetch('/payment/verify', { method: 'POST', body: JSON.stringify({ sessionId }) })
        const latest = res?.data || res
        setData(latest)
        
        // Stop polling only when BOTH conditions are met
        const paid = (latest?.payment?.status === 'succeeded') || (latest?.session?.paymentStatus === 'paid')
        const hasOrderNumber = latest?.order?.orderNumber
        
        if (paid && hasOrderNumber) {
          return // stop polling - we have everything we need
        }
      } catch (e: any) {
        // If we hit 429 (rate limit), increase backoff by moving to next delay
        // apiFetch throws with message; we silently backoff
      } finally {
        attempt += 1
        if (attempt < delaysMs.length && !cancelled) {
          setTimeout(poll, delay)
        }
      }
    }

    // start first poll after initial short wait to avoid immediate spike
    const starter = setTimeout(poll, 2000)

    return () => {
      cancelled = true
      clearTimeout(starter)
    }
  }, [data?.payment?.status, data?.order?.orderNumber, sp])

  // دالة نسخ رقم الطلب مع رسالة تأكيد
  const copyOrderNumber = async (orderNumber: string) => {
    try {
      await navigator.clipboard.writeText(orderNumber)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 3000) // إخفاء الرسالة بعد 3 ثوان
    } catch (err) {
    }
  }

  // إظهار رسالة الواتساب عند نجاح الدفع
  useEffect(() => {
    if (data?.payment?.status === 'succeeded' || data?.session?.paymentStatus === 'paid') {
      setShowWhatsAppMessage(true)
    }
  }, [data?.payment?.status, data?.session?.paymentStatus])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-10 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary arabic-text">نتيجة الدفع</h1>
          <p className="mt-3 text-muted-foreground arabic-text">التحقق من حالة العملية</p>
        </div>
      </section>

      <section className="py-12 relative z-20">
        <div className="container mx-auto px-4 relative z-20">
          {loading && (
            <div className="text-center arabic-text">
              <div className="mb-4">جاري التحقق من العملية...</div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
                <p className="font-semibold mb-2">⚠️ مهم جداً</p>
                <p>يرجى عدم إغلاق هذه الصفحة أو الانتقال لصفحة أخرى حتى يكتمل التحقق من الدفع</p>
                <p className="mt-1">سيتم تحديث الحالة تلقائياً خلال ثوانٍ قليلة</p>
              </div>
            </div>
          )}
          {!loading && error && (
            <div className="max-w-2xl mx-auto p-6 border rounded-lg bg-red-50 border-red-200 text-red-900 arabic-text">
              {error}
            </div>
          )}
          {!loading && !error && data && (
            <div className={`max-w-2xl mx-auto p-6 border rounded-lg ${
              data?.payment?.status === 'pending_webhook_verification' 
                ? 'bg-orange-50 border-orange-200 text-orange-900'
                : 'bg-green-50 border-green-200 text-green-900'
            }`}>
              {data?.payment?.status === 'pending_webhook_verification' ? (
                <>
                  <h2 className="text-2xl font-bold arabic-text mb-2">⏳ جاري التحقق من الدفع</h2>
                  <p className="arabic-text mb-4">دفعتك في PayPal تمت بنجاح، نحن الآن بانتظار التأكيد الآمن.</p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold arabic-text mb-2">🎉 تم الدفع بنجاح</h2>
                  <p className="arabic-text mb-4">شكراً لك! تم استلام طلبك وسيتم البدء بالعمل قريباً.</p>
                </>
              )}
              
              {/* رسائل مدمجة وصغيرة */}
              {(showWhatsAppMessage || data?.payment?.status === 'succeeded' || data?.session?.paymentStatus === 'paid') && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="grid md:grid-cols-2 gap-4 text-center">
                    <div className="bg-green-100 rounded-lg p-3">
                      <div className="text-green-800 arabic-text font-medium text-sm mb-2">
                        📱 تواصل معنا الآن على الواتساب
                      </div>
                      <div className="text-green-600 arabic-text text-xs">
                        فريقنا جاهز للرد خلال دقائق 🚀
                      </div>
                    </div>
                    
                    <div className="bg-purple-100 rounded-lg p-3">
                      <div className="text-purple-800 arabic-text font-medium text-sm mb-2">
                        📧 تفقد إيميلك وحسابك
                      </div>
                      <div className="text-purple-600 arabic-text text-xs">
                        للحصول على روابط التسليم 🎁
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* رسالة نجاح النسخ */}
              {copySuccess && (
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-4 flex items-center gap-2 animate-pulse">
                  <span className="text-blue-600">✅</span>
                  <p className="text-blue-800 arabic-text font-medium">تم نسخ رقم الطلب بنجاح!</p>
                </div>
              )}
              
              {/* Show waiting message if still pending webhook verification */}
              {data?.payment?.status === 'pending_webhook_verification' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-orange-800 mb-4">
                  <div className="flex items-center mb-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mr-3"></div>
                    <p className="font-bold text-lg">⏳ جاري التحقق من الدفع مع PayPal</p>
                  </div>
                  <div className="bg-orange-100 rounded-lg p-4 mb-4">
                    <p className="font-semibold mb-2">🔒 لماذا نحتاج الانتظار؟</p>
                    <ul className="text-sm space-y-1">
                      <li>• PayPal يرسل تأكيد آمن للخادم</li>
                      <li>• لضمان أمان المعاملة والحماية من التلاعب</li>
                      <li>• سيتم إنشاء رقم الطلب فور التأكيد</li>
                    </ul>
                  </div>
                  <p className="text-sm font-medium">✋ يرجى عدم إغلاق هذه الصفحة - التحديث تلقائي خلال ثوانٍ</p>
                  <div className="mt-3 flex items-center justify-center">
                    <div className="animate-pulse bg-orange-200 rounded-full px-4 py-2">
                      <span className="text-sm font-medium">منتظرين تأكيد PayPal...</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-white rounded-md p-4 border relative z-20">
                <div className="flex items-center justify-between mb-2">
                  {data?.order?.orderNumber ? (
                    <>
                      <p className="arabic-text"><b>رقم الطلب:</b> #{data.order.orderNumber}</p>
                      <button 
                        onClick={() => copyOrderNumber(data.order.orderNumber)}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full transition-all duration-200 cursor-pointer hover:scale-105 shadow-sm hover:shadow-md"
                        title="نسخ رقم الطلب"
                      >
                        📋 نسخ
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="arabic-text"><b>رقم الطلب:</b></p>
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">جاري إنشاء رقم الطلب الرسمي...</span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="arabic-text"><b>حالة الدفع:</b> {
                  data?.payment?.status === 'pending_webhook_verification' 
                    ? '🔄 منتظر تأكيد PayPal' 
                    : data?.payment?.status === 'succeeded' 
                      ? '✅ مكتمل' 
                      : data?.payment?.status || data?.session?.paymentStatus
                }</p>
                <p className="arabic-text"><b>المبلغ:</b> {data?.payment?.amount} {data?.payment?.currency}</p>
                {data?.payment?.status === 'pending_webhook_verification' && (
                  <p className="arabic-text text-sm text-yellow-600 mt-2"><b>ملاحظة:</b> سيتم إنشاء رقم الطلب الرسمي بعد التحقق النهائي من الدفع</p>
                )}
              </div>
              <div className="mt-4 flex gap-2 flex-wrap justify-center">
                {whatsAppLink ? (
                  <a 
                    href={`${whatsAppLink}${whatsAppLink.includes('?') ? '&' : '?'}text=مرحباً بصمة تصميم! 🎉%0A%0Aتم الدفع بنجاح${data?.order?.orderNumber ? ` لطلب رقم: ${data.order.orderNumber}` : ' وجاري إنشاء رقم الطلب الرسمي'}%0A%0Aأتطلع لبدء العمل على طلبي. شكراً لكم! 💚`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors arabic-text"
                  >
                    📱 تواصل واتساب
                  </a>
                ) : (
                  <a 
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors arabic-text"
                  >
                    📱 تواصل معنا
                  </a>
                )}
                
                <a 
                  href="/profile" 
                  className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors arabic-text"
                >
                  👤 تفقد حسابك
                </a>
                
                <a 
                  href="/services" 
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors arabic-text"
                >
                  🛒 خدمة أخرى
                </a>
                
                <a href="/" className="inline-flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors arabic-text">
                  🏠 الرئيسية
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
