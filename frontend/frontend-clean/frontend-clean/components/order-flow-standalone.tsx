"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"

// Add CSS animation for spinners
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
import { apiFetch, getToken, fetchServices } from "@/lib/api"
import { useCurrency } from "@/contexts/currency-context"

// Helper function to fix Arabic encoding issues
const fixArabicEncoding = (text: string): string => {
  try {
    // Check if text contains corrupted Arabic encoding
    if (text.includes('Ù') || text.includes('Ø') || text.includes('%') || text.includes('â€')) {
      // Common fallback messages for different contexts
      if (text.includes('PayPal') || text.includes('Ø¯ÙØ¹')) {
        return 'فشل في إنشاء طلب الدفع عبر PayPal. يرجى المحاولة مرة أخرى.';
      }
      if (text.includes('تحقق') || text.includes('ØªØ­Ù‚Ù‚')) {
        return 'تعذر إرسال رمز التحقق. حاول مجددًا.';
      }
      if (text.includes('طلب') || text.includes('Ø·Ù„Ø¨')) {
        return 'حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.';
      }
      // Generic fallback
      return 'حدث خطأ. يرجى المحاولة مرة أخرى.';
    }
    return text;
  } catch (e) {
    return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
  }
}

// =============================
// Standalone Order Flow (Frontend Only)
// - No backend calls
// - No auth dependency
// - Mock services data
// - Single component you can use in any React/Next.js project
// =============================

export type StandaloneOrderData = {
  name: string
  contact: string
  contactType: "email" | "phone"
  email: string
  phone: string
  isVerified: boolean
  verificationCode: string
  service: string
  description: string
  notes: string
  orderId?: string
  orderNumber?: string
  serviceTitle?: string
}

// Remote service type (as returned from lib/api static provider or backend)
type RemoteService = {
  _id: string
  title: { ar: string; en?: string }
  description: { ar: string; en?: string }
  price: { amount: number; currency: string }
  deliveryTime: { min: number; max: number }
  revisions: number
  isActive: boolean
}

export type StandaloneOrderStep = "contact" | "verification" | "order-form" | "payment" | "success"

// Mock services (replace with your real data later)
const MOCK_SERVICES: Array<{
  _id: string
  title: string
  description: string
  price: { amount: number; currency: string }
  deliveryTime: { min: number; max: number }
  revisions: number
  isActive: boolean
}> = [
  {
    _id: "svc1",
    title: "تصميم بوستات سوشيال",
    description: "بوستات احترافية للمنصات الاجتماعية",
    price: { amount: 150, currency: "SAR" },
    deliveryTime: { min: 2, max: 4 },
    revisions: 2,
    isActive: true,
  },
  {
    _id: "svc2",
    title: "تصميم بنرات إعلانية",
    description: "بنرات جذابة للويب والمتاجر",
    price: { amount: 200, currency: "SAR" },
    deliveryTime: { min: 2, max: 5 },
    revisions: 2,
    isActive: true,
  },
  {
    _id: "svc3",
    title: "كتابة محتوى تسويقي",
    description: "محتوى إبداعي ومحسن لمحركات البحث",
    price: { amount: 180, currency: "SAR" },
    deliveryTime: { min: 3, max: 6 },
    revisions: 1,
    isActive: true,
  },
]

const formatPrice = (amount: number, currency = "SAR") => new Intl.NumberFormat("ar-SA", { style: "currency", currency }).format(amount)

export type StandaloneOrderFlowProps = {
  defaultServiceId?: string
  whatsappLink?: string
  postPaymentMessage?: string
  // New props to control flow separation
  mode?: "full" | "request-only" | "payment-only"
  initialStep?: StandaloneOrderStep
  initialData?: Partial<StandaloneOrderData>
  onCompleteRequest?: (data: StandaloneOrderData) => void
  // Lock service selection when coming from services page
  lockServiceSelection?: boolean
}

export function OrderFlowStandalone({ defaultServiceId, whatsappLink, postPaymentMessage, mode = "full", initialStep, initialData, onCompleteRequest, lockServiceSelection = false }: StandaloneOrderFlowProps) {
  const [currentStep, setCurrentStep] = useState<StandaloneOrderStep>(initialStep || "contact")
  const [orderData, setOrderData] = useState<StandaloneOrderData>({
    name: "",
    contact: "",
    contactType: "email",
    email: "",
    phone: "",
    isVerified: false,
    verificationCode: "",
    service: defaultServiceId || initialData?.service || "",
    description: "",
    notes: "",
  })

  // Track if service is locked (pre-selected from services page)
  const [isServiceLocked, setIsServiceLocked] = useState(lockServiceSelection && !!defaultServiceId)

  // Ensure service is set when defaultServiceId is provided
  useEffect(() => {
    if (defaultServiceId && !orderData.service) {
      // Setting default service ID
      updateOrderData({ service: defaultServiceId })
      
      // Also check localStorage for additional service info
      try {
        const stored = localStorage.getItem('selectedService')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed.id === defaultServiceId) {
            // Found matching service info in localStorage
          }
        }
      } catch (e) {
      }
    }
  }, [defaultServiceId, orderData.service])

  // Require login: detect auth token on client
  const isLoggedIn = typeof window !== 'undefined' && !!getToken()

  // Dynamically loaded services list from backend
  const [servicesList, setServicesList] = useState<typeof MOCK_SERVICES>([])
  // Keep for compatibility but we'll derive selected service from servicesList
  const [loadedService, setLoadedService] = useState<typeof MOCK_SERVICES[number] | null>(null)

  useEffect(() => {
    if (defaultServiceId) {
      setOrderData((p) => ({ ...p, service: defaultServiceId }))
    }
  }, [defaultServiceId])

  // Load services from backend
  const loadServices = async () => {
    try {
      const res = await fetchServices(100, 1)
      
      const mapped = (res?.services || [])
        .map((svc: any) => {
          const id = (svc?._id && typeof svc._id === 'string')
            ? svc._id
            : (svc?._id?.toString ? svc._id.toString() : '')
          const usd = (svc as any)?.price?.USD
          const sar = (svc as any)?.price?.SAR ?? (svc as any)?.price?.amount
          
          // Fix: If USD is 0 but SAR has value, use SAR converted to USD
          const finalPrice = (usd && usd > 0) ? usd : (sar && sar > 0) ? sar / 3.75 : 0
          const baseAmount = (typeof usd === 'number') ? usd : (typeof sar === 'number' ? sar : 0)
          const baseCurrency = (typeof usd === 'number') ? 'USD' : 'SAR'
          
          // Enhanced title handling for different formats
          let finalTitle = 'خدمة'
          if (typeof svc?.title === 'string') {
            finalTitle = svc.title
          } else if (svc?.title?.ar) {
            finalTitle = svc.title.ar
          } else if (svc?.title?.en) {
            finalTitle = svc.title.en
          } else if (typeof svc?.title === 'object' && svc.title) {
            // Handle any other object format
            finalTitle = Object.values(svc.title)[0] as string || 'خدمة'
          }

          // Enhanced description handling
          let finalDescription = ''
          if (typeof svc?.description === 'string') {
            finalDescription = svc.description
          } else if (svc?.description?.ar) {
            finalDescription = svc.description.ar
          } else if (svc?.description?.en) {
            finalDescription = svc.description.en
          } else if (typeof svc?.description === 'object' && svc.description) {
            finalDescription = Object.values(svc.description)[0] as string || ''
          }

          const mapped = {
            _id: id,
            title: finalTitle,
            description: finalDescription,
            price: { amount: finalPrice, currency: 'USD' }, // Use converted price if USD was 0
            deliveryTime: svc?.deliveryTime || { min: 2, max: 5 },
            revisions: typeof svc?.revisions === 'number' ? svc?.revisions : 0,
            isActive: svc?.isActive !== false,
          } as typeof MOCK_SERVICES[number]
          
          // Service found and processed
          
          return mapped
        })
        // Keep only valid Mongo ObjectIds to avoid backend CastError
        .filter((s: any) => {
          const isValid = /^[0-9a-fA-F]{24}$/.test(String(s?._id))
          if (!isValid) {
          }
          return isValid
        }) as typeof MOCK_SERVICES
      
      // Services loaded successfully
      
      // Service validation completed
      
      setServicesList(mapped)
    } catch (e) {
      // If backend fails, keep list empty to avoid showing stale static items
      setServicesList([])
    }
  }

  useEffect(() => {
    let ignore = false
    const load = async () => {
      await loadServices()
    }
    load()
    return () => { ignore = true }
  }, [])

  // If a prefilled service (e.g., from localStorage) isn't a valid one from backend, clear it
  // BUT: Don't clear if service is locked (pre-selected from services page)
  useEffect(() => {
    if (orderData.service && !servicesList.some((s) => s._id === orderData.service)) {
      // Don't clear service if it's locked (came from service detail page)
      if (!isServiceLocked) {
        // Clearing invalid service
        updateOrderData({ service: '' })
      } else {
        // Keeping locked service
      }
    }
  }, [servicesList, isServiceLocked, orderData.service])

  const updateOrderData = (data: Partial<StandaloneOrderData>) => setOrderData((prev) => ({ ...prev, ...data }))

  // Apply any provided initialData (one-time on mount)
  useEffect(() => {
    if (initialData) {
      setOrderData((prev) => ({
        ...prev,
        ...initialData,
        // ensure contactType defaults to email when not provided
        contactType: (initialData.contactType as any) || prev.contactType,
      }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Derive selected service from servicesList; disable legacy single fetch
  useEffect(() => {
    if (!orderData.service) { 
      setLoadedService(null); 
      return 
    }
    const found = servicesList.find((s) => s._id === orderData.service) || null
    if (found) {
      // Selected service found
    } else if (orderData.service) {
      // Selected service not yet loaded
      
      // Auto-retry loading services if we have a service ID but can't find it
      if (servicesList.length > 0) {
        setTimeout(() => loadServices(), 1000)
      }
    }
    setLoadedService(found)
  }, [orderData.service, servicesList])

  // Always enable verification step for all users (they might use different email than their account)
  const verificationEnabled = (mode === "payment-only" || mode === "full" || mode === "request-only")

  // Determine steps based on mode
  const steps: StandaloneOrderStep[] = useMemo(() => {
    if (mode === "request-only") return (verificationEnabled 
      ? ["contact", "order-form", "verification"] 
      : ["contact", "order-form"]) as any
    if (mode === "payment-only") return (verificationEnabled 
      ? ["contact", "verification", "payment", "success"] 
      : ["contact", "payment", "success"]) as any
    return (verificationEnabled
      ? ["contact", "order-form", "verification", "payment", "success"]
      : ["contact", "order-form", "payment", "success"]) as any
  }, [mode, verificationEnabled])

  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      let target = steps[currentIndex + 1]
      setCurrentStep(target)
    }
  }

  const goToStep = (step: StandaloneOrderStep) => setCurrentStep(step)

  const selectedService = useMemo(() => {
    if (loadedService) return loadedService
    const found = servicesList.find((s) => s._id === orderData.service)
    if (found) {
      return found
    }
    
    // If service not found, try fallbacks
    if (orderData.service && servicesList.length > 0) {
      
      // Try to get service info from localStorage as fallback
      try {
        const storedService = localStorage.getItem('selectedService')
        if (storedService) {
          const parsed = JSON.parse(storedService)
          if (parsed.id === orderData.service) {
            const fallbackPrice = parsed.price || parsed.usd || parsed.amount || 0
            return {
              _id: parsed.id,
              title: parsed.title,
              description: parsed.description || '',
              price: { 
                amount: fallbackPrice, 
                currency: parsed.currency || 'USD',
                USD: fallbackPrice,
                SAR: fallbackPrice * 3.75 // approximate conversion
              },
              deliveryTime: parsed.deliveryTime || { min: 1, max: 7 },
              revisions: parsed.revisions || 2,
              isActive: true // Always true for selected services
            }
          }
        }
      } catch (e) {
      }
      
      // Hardcoded fallback for known services if localStorage fails
      if (orderData.service) {
        // Using hardcoded fallback for service ID
        return {
          _id: orderData.service,
          title: "إدارة حسابات السوشيال ميديا",
          description: "إدارة شاملة لحساباتك الرقمية",
          price: { 
            amount: 200, // Default price - will be updated when real service loads
            currency: 'USD'
          },
          deliveryTime: { min: 1, max: 7 },
          revisions: 2,
          isActive: true
        }
      }
    }
    return null
  }, [orderData.service, loadedService, servicesList])

  // Progress percent (robust against mismatches)
  const progressIndex = Math.max(0, steps.indexOf(currentStep))
  const progressPercent = steps.length > 1 && isFinite(progressIndex) ? (progressIndex / (steps.length - 1)) * 100 : 0

  return (
    <div style={{ padding: "3rem 0", position: "relative", zIndex: 100 }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 1rem", position: "relative", zIndex: 100 }}>
        {/* Progress */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            {steps.map((stepKey, index) => {
              const labelsByStep: Record<StandaloneOrderStep, string> = {
                contact: "معلومات التواصل",
                verification: "التحقق",
                "order-form": "تفاصيل الطلب",
                payment: "الدفع",
                success: "مكتمل",
              }
              const label = labelsByStep[stepKey]
              const isActive = currentStep === stepKey
              const isCompleted = steps.indexOf(currentStep) > index
              const circleStyle: React.CSSProperties = {
                width: 34,
                height: 34,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 6,
                color: isCompleted || isActive ? "#fff" : "#475569",
                background: isCompleted ? "#7c3aed" : isActive ? "#22d3ee" : "#e2e8f0",
                fontWeight: 600,
                transition: "all .2s",
              }
              const textStyle: React.CSSProperties = { fontSize: 12, textAlign: "center", maxWidth: 68 }
              return (
                <div key={`${stepKey}-${index}`} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={circleStyle}>{index + 1}</div>
                  <span style={textStyle}>{label}</span>
                </div>
              )
            })}
          </div>
          <div style={{ width: "100%", height: 8, background: "#e2e8f0", borderRadius: 999 }}>
            <div
              style={{
                height: 8,
                background: "#7c3aed",
                borderRadius: 999,
                width: `${progressPercent}%`,
                transition: "width .3s",
              }}
            />
          </div>
        </div>

        {/* Steps or Login Required Guard */}
        {!isLoggedIn ? (
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, background: '#fff7ed' }}>
            <h3 className="arabic-text" style={{ fontSize: 20, fontWeight: 700, color: '#b45309', marginBottom: 8 }}>تسجيل الدخول مطلوب</h3>
            <p className="arabic-text" style={{ color: '#92400e', marginBottom: 12 }}>
              لإنشاء طلب جديد وتتبع حالته، يرجى تسجيل الدخول أولاً. هذا يساعدنا على ربط طلباتك بحسابك وتسريع التواصل والدعم.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a 
                href="/login" 
                className="arabic-text" 
                style={{ 
                  padding: '10px 14px', 
                  borderRadius: 10, 
                  background: '#7c3aed', 
                  color: '#fff', 
                  textDecoration: 'none', 
                  fontWeight: 700,
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#6d28d9'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#7c3aed'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                🔑 تسجيل الدخول
              </a>
              <a 
                href="/register" 
                className="arabic-text" 
                style={{ 
                  padding: '10px 14px', 
                  borderRadius: 10, 
                  border: '1px solid #e2e8f0', 
                  textDecoration: 'none', 
                  fontWeight: 700,
                  background: 'white',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f8fafc'
                  e.currentTarget.style.borderColor = '#cbd5e1'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white'
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                ✨ إنشاء حساب
              </a>
            </div>
            <ul className="arabic-text" style={{ marginTop: 12, color: '#92400e', paddingInlineStart: 18 }}>
              <li>ربط الطلبات بحسابك</li>
              <li>تتبع حالة الدفع والتنفيذ بسهولة</li>
              <li>تواصل أسرع ودعم أفضل</li>
            </ul>
          </div>
        ) : (
          <>
            {steps.includes("contact") && currentStep === "contact" && (
              <ContactStep orderData={orderData} updateOrderData={updateOrderData} nextStep={nextStep} />
            )}
            {verificationEnabled && steps.includes("verification") && currentStep === "verification" && (
              <VerificationStep orderData={orderData} updateOrderData={updateOrderData} nextStep={nextStep} goToStep={goToStep} />
            )}
            {steps.includes("order-form") && currentStep === "order-form" && (
              <OrderFormStep
                orderData={orderData}
                updateOrderData={updateOrderData}
                // If in request-only mode and a completion handler is provided, call it instead of going to payment
                nextStep={() => {
                  if (mode === "request-only" && onCompleteRequest) {
                    // Ensure verification is completed before saving draft
                    if (!orderData.isVerified) {
                      alert('يرجى إتمام التحقق من البريد الإلكتروني أولاً')
                      return
                    }
                    onCompleteRequest(orderData)
                  } else {
                    nextStep()
                  }
                }}
                services={servicesList}
                selectedService={selectedService}
                isServiceLocked={isServiceLocked}
                onClearServiceSelection={() => setIsServiceLocked(false)}
                loadServices={loadServices}
              />
            )}
            {steps.includes("payment") && currentStep === "payment" && (
              <PaymentStep orderData={orderData} updateOrderData={updateOrderData} nextStep={nextStep} selectedService={selectedService} isLoggedIn={isLoggedIn} />
            )}
            {steps.includes("success") && currentStep === "success" && (
              <SuccessStep orderData={orderData} whatsappLink={whatsappLink} postPaymentMessage={postPaymentMessage} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ============ Contact Step ============
function ContactStep({
  orderData,
  updateOrderData,
  nextStep,
}: {
  orderData: StandaloneOrderData
  updateOrderData: (data: Partial<StandaloneOrderData>) => void
  nextStep: () => void
}) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!orderData.name.trim()) e.name = "الاسم الكامل مطلوب"
    
    // Validate email (required)
    if (!orderData.email.trim()) {
      e.email = "البريد الإلكتروني مطلوب"
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(orderData.email)) e.email = "يرجى إدخال بريد إلكتروني صحيح"
    }
    
    // Validate phone (required)
    if (!orderData.phone.trim()) {
      e.phone = "رقم الهاتف مطلوب"
    } else {
      const phoneRegex = /^[0-9+\-\s()]{10,}$/
      if (!phoneRegex.test(orderData.phone)) e.phone = "يرجى إدخال رقم هاتف صحيح"
    }
    
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (validate()) nextStep()
  }

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
  }

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 20 }}>
      <h3 className="arabic-text" style={{ fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 4 }}>
        معلومات التواصل
      </h3>
      <p className="arabic-text" style={{ textAlign: "center", color: "#64748b", marginBottom: 16 }}>
        يرجى إدخال معلومات التواصل الخاصة بك للمتابعة
      </p>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
        <div>
          <label className="arabic-text" htmlFor="name" style={{ display: "block", marginBottom: 6 }}>
            الاسم الكامل *
          </label>
          <input
            id="name"
            value={orderData.name}
            onChange={(e) => updateOrderData({ name: e.target.value })}
            placeholder="أدخل اسمك الكامل"
            style={{ ...inputBase, borderColor: errors.name ? "#ef4444" : "#e2e8f0" }}
          />
          {errors.name && <p className="arabic-text" style={{ color: "#ef4444", fontSize: 12 }}>{errors.name}</p>}
        </div>

        <div>
          <label className="arabic-text" htmlFor="email" style={{ display: "block", marginBottom: 6 }}>
            البريد الإلكتروني *
          </label>
          <input
            id="email"
            type="email"
            value={orderData.email}
            onChange={(e) => updateOrderData({ email: e.target.value, contactType: "email", contact: e.target.value })}
            placeholder="example@email.com"
            style={{ ...inputBase, borderColor: errors.email ? "#ef4444" : "#e2e8f0" }}
            dir="ltr"
          />
          {errors.email && <p className="arabic-text" style={{ color: "#ef4444", fontSize: 12 }}>{errors.email}</p>}
        </div>

        <div>
          <label className="arabic-text" htmlFor="phone" style={{ display: "block", marginBottom: 6 }}>
            رقم الهاتف *
          </label>
          <input
            id="phone"
            type="tel"
            value={orderData.phone}
            onChange={(e) => updateOrderData({ phone: e.target.value })}
            placeholder="+966 50 123 4567"
            style={{ ...inputBase, borderColor: errors.phone ? "#ef4444" : "#e2e8f0" }}
            dir="rtl"
          />
          {errors.phone && <p className="arabic-text" style={{ color: "#ef4444", fontSize: 12 }}>{errors.phone}</p>}
        </div>

        {/* Enhanced button with cursor pointer and hover effects */}
        <button
          type="submit"
          className="arabic-text"
          style={{ 
            width: "100%", 
            padding: "12px 16px", 
            borderRadius: 10, 
            background: "#7c3aed", 
            color: "#fff", 
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease",
            border: "none",
            position: "relative",
            zIndex: 9999
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#6d28d9"
            e.currentTarget.style.transform = "translateY(-1px)"
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(124, 58, 237, 0.3)"
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#7c3aed"
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          متابعة للتحقق
        </button>
      </form>
    </div>
  )
}

// ============ Verification Step ============
function VerificationStep({
  orderData,
  updateOrderData,
  nextStep,
  goToStep,
}: {
  orderData: StandaloneOrderData
  updateOrderData: (data: Partial<StandaloneOrderData>) => void
  nextStep: () => void
  goToStep: (step: StandaloneOrderStep) => void
}) {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [info, setInfo] = useState<string>("")
  const [emailSent, setEmailSent] = useState(false) // 🔒 منع الإرسال المزدوج

  // 🔒 useRef لتتبع ما إذا كان الإرسال الأولي قد تم بالفعل
  const initialCodeSentRef = useRef(false);

  // إعادة تعيين العلامة عند تحميل المكون لأول مرة
  useEffect(() => {
    initialCodeSentRef.current = false;
    setEmailSent(false);
  }, []); // يتم تشغيله مرة واحدة فقط عند تحميل المكون

  useEffect(() => {
    // منع الإرسال المتكرر - فحص بـ useRef فقط
    if (initialCodeSentRef.current) {
      return;
    }

    if (!orderData.orderId || !orderData.email) {
      setError('يرجى إكمال تفاصيل الطلب أولاً')
      return
    }

    // تعيين العلامة فوراً لمنع الاستدعاءات المتوازية
    initialCodeSentRef.current = true;

    // on mount: require orderId then send code via backend
    setCountdown(60)
    setCanResend(false)
    
    const sendInitialCode = async () => {
      try {
        setIsLoading(true)
        setError("")
        
        console.log('🔍 Sending initial verification code for order:', orderData.orderId);
        
        const res: any = await apiFetch<any>('/checkout/email/send-code', { method: 'POST', body: JSON.stringify({ 
          orderId: orderData.orderId, 
          email: orderData.email, 
          name: orderData.name, 
          phone: orderData.phone,
          serviceId: orderData.service, // 🎯 معرف الخدمة
          description: orderData.description, // 🎯 وصف المشروع
          notes: orderData.notes // 🎯 ملاحظات إضافية
        }) })
        
        const baseMsg = res?.message || 'تم إرسال رمز التحقق'
        setInfo(baseMsg)
        setEmailSent(true) // تعيين حالة الإرسال بعد النجاح
        console.log('✅ Verification code sent successfully');
        
      } catch (e: any) {
        console.error('❌ Failed to send verification code:', e);
        setError(fixArabicEncoding(e?.message || 'تعذر إرسال رمز التحقق. حاول مجددًا.'));
        // إعادة تعيين العلامات في حالة الخطأ للسماح بالمحاولة مرة أخرى
        initialCodeSentRef.current = false;
        setEmailSent(false);
      } finally {
        setIsLoading(false)
      }
    }
    
    // تأخير قصير لضمان عدم التداخل
    const timeoutId = setTimeout(sendInitialCode, 100);
    
    // تنظيف timeout في حالة unmount
    return () => {
      clearTimeout(timeoutId);
    };
  }, [orderData.orderId, orderData.email]) // إزالة emailSent من dependencies لمنع infinite loop

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const t = setTimeout(() => setCountdown((s) => s - 1), 1000)
      return () => clearTimeout(t)
    } else if (countdown === 0) {
      setCanResend(true)
    }
  }, [countdown, canResend])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      if (!orderData.orderId) throw new Error('لا يوجد معرف طلب')
      
      // Sending verification request
      
      const res: any = await apiFetch<any>('/checkout/email/verify', { method: 'POST', body: JSON.stringify({ orderId: orderData.orderId, email: orderData.email, code }) })
      if (res?.success) {
        updateOrderData({ isVerified: true, verificationCode: code })
        nextStep()
      } else {
        const errorMsg = res?.message || 'رمز التحقق غير صحيح';
        
        // Show elegant error modal for ANY verification error
        if (true) { // Always show modal for verification errors
          // Show elegant modal with refresh suggestion
          const modalHtml = `
            <div id="verification-error-modal" style="
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.7);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 10000;
              backdrop-filter: blur(8px);
              animation: fadeIn 0.3s ease-out;
            ">
              <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                padding: 40px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
                color: white;
                position: relative;
                overflow: hidden;
              ">
                <div style="
                  position: absolute;
                  top: -50%;
                  left: -50%;
                  width: 200%;
                  height: 200%;
                  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                  animation: shimmer 3s infinite;
                "></div>
                
                <div style="position: relative; z-index: 1;">
                  <div style="
                    font-size: 4rem;
                    margin-bottom: 20px;
                    animation: bounce 2s infinite;
                  ">⏰</div>
                  
                  <h2 style="
                    font-size: 1.8rem;
                    font-weight: 700;
                    margin-bottom: 15px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  ">رمز التحقق غير صحيح أو منتهي الصلاحية</h2>
                  
                  <p style="
                    font-size: 1.1rem;
                    margin-bottom: 30px;
                    opacity: 0.9;
                    line-height: 1.6;
                  ">
                    ${errorMsg}<br><br>
                    لحل هذه المشكلة، يرجى اختيار أحد الخيارات التالية:
                  </p>
                  
                  <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="location.reload()" style="
                      background: rgba(255, 255, 255, 0.2);
                      border: 2px solid rgba(255, 255, 255, 0.3);
                      color: white;
                      padding: 12px 24px;
                      border-radius: 12px;
                      font-size: 1rem;
                      font-weight: 600;
                      cursor: pointer;
                      transition: all 0.3s ease;
                      backdrop-filter: blur(10px);
                    " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                      🔄 إعادة تحميل الصفحة
                    </button>
                    
                    <button onclick="document.getElementById('verification-error-modal').remove()" style="
                      background: rgba(255, 255, 255, 0.9);
                      border: none;
                      color: #667eea;
                      padding: 12px 24px;
                      border-radius: 12px;
                      font-size: 1rem;
                      font-weight: 600;
                      cursor: pointer;
                      transition: all 0.3s ease;
                    " onmouseover="this.style.background='white'" onmouseout="this.style.background='rgba(255,255,255,0.9)'">
                      📧 طلب رمز جديد
                    </button>
                  </div>
                  
                  <p style="
                    font-size: 0.9rem;
                    margin-top: 20px;
                    opacity: 0.7;
                  ">
                    💡 نصيحة: احرص على إدخال الرمز فور وصوله لتجنب انتهاء الصلاحية
                  </p>
                </div>
              </div>
            </div>
            
            <style>
              @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
              }
              
              @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
              }
              
              @keyframes shimmer {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          `;
          
          // Remove existing modal if any
          const existingModal = document.getElementById('verification-error-modal');
          if (existingModal) existingModal.remove();
          
          // Add modal to body
          document.body.insertAdjacentHTML('beforeend', modalHtml);
          
          // Auto-close after 10 seconds
          setTimeout(() => {
            const modal = document.getElementById('verification-error-modal');
            if (modal) modal.remove();
          }, 10000);
        }
        
        setError(errorMsg.includes('Ù') || errorMsg.includes('Ø') 
          ? 'رمز التحقق غير صحيح أو منتهي الصلاحية' 
          : errorMsg);
      }
    } catch (e: any) {
      const errorMsg = e?.message || 'خطأ أثناء التحقق. حاول مرة أخرى.';
      
      // Show elegant error modal for network/server errors too
      if (true) { // Always show modal for any error
        // Show elegant modal with refresh suggestion
        const modalHtml = `
          <div id="verification-error-modal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(8px);
            animation: fadeIn 0.3s ease-out;
          ">
            <div style="
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              border-radius: 20px;
              padding: 40px;
              max-width: 500px;
              width: 90%;
              text-align: center;
              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
              color: white;
              position: relative;
              overflow: hidden;
            ">
              <div style="position: relative; z-index: 1;">
                <div style="
                  font-size: 4rem;
                  margin-bottom: 20px;
                  animation: bounce 2s infinite;
                ">⚠️</div>
                
                <h2 style="
                  font-size: 1.8rem;
                  font-weight: 700;
                  margin-bottom: 15px;
                  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">حدث خطأ في الاتصال</h2>
                
                <p style="
                  font-size: 1.1rem;
                  margin-bottom: 30px;
                  opacity: 0.9;
                  line-height: 1.6;
                ">
                  يبدو أن هناك مشكلة في الاتصال بالخادم.<br>
                  يرجى المحاولة مرة أخرى أو إعادة تحميل الصفحة.
                </p>
                
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                  <button onclick="location.reload()" style="
                    background: rgba(255, 255, 255, 0.2);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                  " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    🔄 إعادة تحميل الصفحة
                  </button>
                  
                  <button onclick="document.getElementById('verification-error-modal').remove()" style="
                    background: rgba(255, 255, 255, 0.9);
                    border: none;
                    color: #f5576c;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                  " onmouseover="this.style.background='white'" onmouseout="this.style.background='rgba(255,255,255,0.9)'">
                    ❌ إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('verification-error-modal');
        if (existingModal) existingModal.remove();
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Auto-close after 8 seconds
        setTimeout(() => {
          const modal = document.getElementById('verification-error-modal');
          if (modal) modal.remove();
        }, 8000);
      }
      
      setError(errorMsg.includes('Ù') || errorMsg.includes('Ø') 
        ? 'خطأ أثناء التحقق. حاول مرة أخرى.' 
        : errorMsg);
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    // 🔒 منع الاستدعاءات المتعددة
    if (isLoading) {
      return;
    }
    
    setIsLoading(true)
    setError("")
    try {
      if (!orderData.orderId) throw new Error('لا يوجد معرف طلب')
      
      
      const res: any = await apiFetch<any>('/checkout/email/send-code', { method: 'POST', body: JSON.stringify({ 
        orderId: orderData.orderId, 
        email: orderData.email, 
        name: orderData.name, 
        phone: orderData.phone,
        serviceId: orderData.service, // 🎯 معرف الخدمة
        description: orderData.description, // 🎯 وصف المشروع
        notes: orderData.notes // 🎯 ملاحظات إضافية
      }) })
      
      const infoMsg = res?.message || 'تم إرسال رمز جديد';
      setInfo(infoMsg.includes('Ù') || infoMsg.includes('Ø') 
        ? 'تم إرسال رمز جديد' 
        : infoMsg);
      setCountdown(60)
      setCanResend(false)
      setEmailSent(true) // تأكيد حالة الإرسال
      
    } catch (e: any) {
      const errorMsg = e?.message || 'تعذر إرسال رمز جديد. حاول لاحقًا.';
      setError(errorMsg.includes('Ù') || errorMsg.includes('Ø') 
        ? 'تعذر إرسال رمز جديد. حاول لاحقًا.' 
        : errorMsg);
    } finally {
      setIsLoading(false)
    }
  }

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    textAlign: "center",
    letterSpacing: 4,
    fontSize: 22,
  }

  const smallMuted: React.CSSProperties = { fontSize: 13, color: "#64748b" }

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 20 }}>
      <h3 className="arabic-text" style={{ fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 4 }}>
        التحقق من الهوية
      </h3>
      <p className="arabic-text" style={{ textAlign: "center", color: "#64748b", marginBottom: 8 }}>
        تم إرسال رمز التحقق إلى بريدك الإلكتروني
      </p>
      <p className="arabic-text" style={{ textAlign: "center", color: "#7c3aed", marginBottom: 16, fontWeight: 600 }}>
        {orderData.email}
      </p>
      {info && (
        <div style={{ marginBottom: 8, padding: 10, background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 8 }}>
          <p className="arabic-text" style={{ margin: 0, color: '#3730a3', fontSize: 13 }}>
            {/* إصلاح عرض النص العربي */}
            {(() => {
              try {
                // محاولة فك ترميز النص إذا كان مُرمز
                if (info.includes('%') || info.includes('Ø') || info.includes('Ù')) {
                  return 'تم إرسال رمز التحقق إلى بريدك الإلكتروني. الكود صالح لمدة 10 دقائق.';
                }
                return info;
              } catch (e) {
                return 'تم إرسال رمز التحقق إلى بريدك الإلكتروني. الكود صالح لمدة 10 دقائق.';
              }
            })()}
          </p>
        </div>
      )}

      <form onSubmit={handleVerify} style={{ display: "grid", gap: 16 }}>
        <div>
          <label className="arabic-text" htmlFor="code" style={{ display: "block", marginBottom: 6 }}>
            رمز التحقق (6 أرقام) *
          </label>
          <input
            id="code"
            value={code}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 6)
              setCode(v)
              setError("")
            }}
            placeholder="123456"
            style={inputBase}
            maxLength={6}
            dir="ltr"
          />
          {error && <p className="arabic-text" style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>{error}</p>}
        </div>

        <div style={{ textAlign: "center" }}>
          {!canResend ? (
            <p className="arabic-text" style={smallMuted}>يمكنك طلب رمز جديد خلال {`${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`}</p>
          ) : (
            <button 
              type="button" 
              onClick={handleResend} 
              disabled={isLoading} 
              className="arabic-text" 
              style={{ 
                background: "transparent", 
                color: "#7c3aed",
                cursor: isLoading ? "not-allowed" : "pointer",
                border: "1px solid #7c3aed",
                padding: "6px 12px",
                borderRadius: 6,
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = "#f3f4f6"
                  e.currentTarget.style.color = "#6d28d9"
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = "#7c3aed"
                }
              }}
            >
              {isLoading ? "جاري الإرسال..." : "إرسال رمز جديد"}
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button 
            type="button" 
            onClick={() => goToStep("contact")} 
            className="arabic-text" 
            style={{ 
              flex: 1, 
              padding: "10px 12px", 
              borderRadius: 10, 
              border: "1px solid #e2e8f0", 
              background: "transparent",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#f8fafc"
              e.currentTarget.style.borderColor = "#cbd5e1"
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.borderColor = "#e2e8f0"
            }}
          >
            رجوع
          </button>
          <button 
            type="submit" 
            disabled={code.length !== 6 || isLoading} 
            className="arabic-text" 
            style={{ 
              flex: 1, 
              padding: "10px 12px", 
              borderRadius: 10, 
              background: (code.length !== 6 || isLoading) ? "#94a3b8" : "#7c3aed", 
              color: "#fff", 
              fontWeight: 700,
              cursor: (code.length !== 6 || isLoading) ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              border: "none",
              position: "relative",
              zIndex: 9999
            }}
            onMouseOver={(e) => {
              if (code.length === 6 && !isLoading) {
                e.currentTarget.style.background = "#6d28d9"
                e.currentTarget.style.transform = "translateY(-1px)"
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(124, 58, 237, 0.3)"
              }
            }}
            onMouseOut={(e) => {
              if (code.length === 6 && !isLoading) {
                e.currentTarget.style.background = "#7c3aed"
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "none"
              }
            }}
          >
            {isLoading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ 
                  width: 16, 
                  height: 16, 
                  border: "2px solid #ffffff40", 
                  borderTop: "2px solid #ffffff", 
                  borderRadius: "50%", 
                  animation: "spin 1s linear infinite" 
                }}>
                </span>
                جاري التحقق...
              </span>
            ) : "تحقق ومتابعة"}
          </button>
        </div>
      </form>

      <div style={{ marginTop: 16, padding: 12, background: "#f1f5f9", borderRadius: 10 }}>
        <p className="arabic-text" style={{ ...smallMuted, textAlign: "center" }}>
          لم تستلم الرمز؟ تحقق من مجلد الرسائل غير المرغوب فيها أو تأكد من صحة معلومات التواصل
        </p>
      </div>
    </div>
  )
}

// ============ Order Form Step ============
function OrderFormStep({
  orderData,
  updateOrderData,
  nextStep,
  services,
  selectedService,
  isServiceLocked = false,
  onClearServiceSelection,
  loadServices,
}: {
  orderData: StandaloneOrderData
  updateOrderData: (data: Partial<StandaloneOrderData>) => void
  nextStep: () => void
  services: typeof MOCK_SERVICES
  selectedService: typeof MOCK_SERVICES[number] | null
  isServiceLocked?: boolean
  onClearServiceSelection?: () => void
  loadServices?: () => Promise<void>
}) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { currency, convert, format } = useCurrency()
  // Use selected service's currency if available; fallback to SAR
  const backendCurrency: 'USD' | 'SAR' = (selectedService?.price?.currency === 'USD' ? 'USD' : 'SAR')

  const validate = () => {
    const e: Record<string, string> = {}
    if (!orderData.service) e.service = "يرجى اختيار الخدمة المطلوبة"
    if (!orderData.description.trim()) e.description = "وصف المشروع مطلوب"
    else if (orderData.description.trim().length < 20) e.description = "يرجى إدخال وصف أكثر تفصيلاً (20 حرف على الأقل)"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setSubmitError(null)
    if (!validate()) return
    if (!selectedService) {
      setSubmitError('يرجى اختيار خدمة صالحة قبل المتابعة')
      return
    }

    try {
      setIsSubmitting(true)
      
      // بدلاً من حفظ الطلب في قاعدة البيانات، احفظه محلياً فقط
      // سيتم حفظه في قاعدة البيانات فقط عند نجاح الدفع
      
      // Build order data for local storage
      const tempOrderData = {
        tempId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        items: [{
          serviceId: (selectedService as any)._id || orderData.service,
          title: typeof selectedService.title === 'object' ? ((selectedService.title as any)?.ar || (selectedService.title as any)?.en) : selectedService.title,
          quantity: 1,
          price: selectedService.price?.amount || (selectedService.price as any)?.SAR || 0,
          currency: backendCurrency
        }],
        guestInfo: { 
          name: orderData.name, 
          email: orderData.email, 
          phone: orderData.phone 
        },
        currency: backendCurrency,
        notes: (orderData.notes || '').slice(0, 500),
        description: orderData.description?.trim() || '',
        total: selectedService.price?.amount || (selectedService.price as any)?.SAR || 0,
        createdAt: new Date().toISOString(),
        status: 'draft' // حالة مسودة قبل الدفع
      }
      
      // حفظ البيانات محلياً
      localStorage.setItem('pendingOrder', JSON.stringify(tempOrderData))
      // Order saved locally
      
      // 🎯 إنشاء طلب حقيقي في قاعدة البيانات
      try {
        // Creating order in database
        
        const orderResponse = await apiFetch<any>('/orders', {
          method: 'POST',
          body: JSON.stringify({
            items: [{
              serviceId: orderData.service,
              quantity: 1
            }],
            guestInfo: { 
              name: orderData.name, 
              email: orderData.email, 
              phone: orderData.phone 
            },
            description: orderData.description?.trim() || '',
            notes: orderData.notes?.trim() || '',
            currency: backendCurrency
            // إزالة total - خلي الـ backend يحسبه لوحده
          }),
          auth: !!getToken() // استخدم auth فقط إذا كان المستخدم مسجل دخول
        });
        
        // Order creation response received
        
        // تحديث معرف الطلب الحقيقي
        if (orderResponse?.success && orderResponse?.data?.order?._id) {
          const realOrderId = orderResponse.data.order._id;
          // Order created successfully
          
          // تحديث البيانات المحلية
          (tempOrderData as any).realOrderId = realOrderId;
          localStorage.setItem('pendingOrder', JSON.stringify(tempOrderData));
          
          // تحديث بيانات الطلب
          updateOrderData({ 
            orderId: realOrderId,
            serviceTitle: selectedService.title
          });
        } else {
          throw new Error('فشل في الحصول على معرف الطلب');
        }
        
      } catch (error) {
        setSubmitError('حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى.');
        return;
      }
      
      // البيانات تم تحديثها بالفعل في try block أعلاه
      
      nextStep()
      
    } catch (e: any) {
      setSubmitError('حدث خطأ أثناء تحضير الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false)
    }
  }

  /* uploads removed */

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
  }

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 20 }}>
      <h3 className="arabic-text" style={{ fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 4 }}>
        تفاصيل الطلب
      </h3>
      <p className="arabic-text" style={{ textAlign: "center", color: "#64748b", marginBottom: 16 }}>
        يرجى تعبئة تفاصيل مشروعك بدقة لنتمكن من تقديم أفضل خدمة
      </p>

      {selectedService && (
        <div style={{ marginBottom: 16, padding: 16, background: isServiceLocked ? "#eef2ff" : "#f1f5f9", borderRadius: 12, border: isServiceLocked ? "2px solid #7c3aed" : "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <p className="arabic-text" style={{ margin: 0, fontWeight: 700, fontSize: 16, color: isServiceLocked ? "#7c3aed" : "#1f2937" }}>
                {isServiceLocked ? "🎯 الخدمة المحددة:" : "الخدمة المختارة:"} {typeof selectedService.title === 'object' ? ((selectedService.title as any)?.ar || (selectedService.title as any)?.en) : selectedService.title}
              </p>
              <p className="arabic-text" style={{ margin: "4px 0 0 0", fontSize: 14, color: "#64748b" }}>
                {typeof selectedService.description === 'object' ? ((selectedService.description as any)?.ar || (selectedService.description as any)?.en) : selectedService.description}
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "#64748b", background: "#f8fafc", padding: "2px 6px", borderRadius: 4 }}>
                  ⏱️ {selectedService.deliveryTime.min}-{selectedService.deliveryTime.max} أيام
                </span>
                <span style={{ fontSize: 12, color: "#64748b", background: "#f8fafc", padding: "2px 6px", borderRadius: 4 }}>
                  🔄 {selectedService.revisions} تعديلات مجانية
                </span>
              </div>
            </div>
            <div style={{ textAlign: "left", minWidth: "120px" }}>
              <p className="arabic-text" style={{ margin: 0, fontWeight: 700, fontSize: 18, color: isServiceLocked ? "#7c3aed" : "#1f2937" }}>
                {(() => {
                  // Handle different price formats
                  if (selectedService.price?.currency && selectedService.price?.amount) {
                    // New format: {currency: 'USD', amount: 100}
                    return selectedService.price.currency === 'USD' 
                      ? `$${selectedService.price.amount}` 
                      : `${selectedService.price.amount} ر.س`;
                  } else if ((selectedService.price as any)?.SAR || (selectedService.price as any)?.USD) {
                    // Old format: {SAR: 100, USD: 27}
                    return backendCurrency === 'USD' && (selectedService.price as any).USD
                      ? `$${(selectedService.price as any).USD}`
                      : `${(selectedService.price as any).SAR || (selectedService.price as any).USD || 0} ر.س`;
                  } else {
                    // Fallback
                    return 'السعر غير متوفر';
                  }
                })()}
              </p>
              <p className="arabic-text" style={{ margin: "2px 0 0 0", fontSize: 12, color: "#64748b" }}>
                {(() => {
                  if (selectedService.price?.currency) {
                    return selectedService.price.currency === 'USD' ? 'السعر (USD)' : 'السعر (SAR)';
                  } else if ((selectedService.price as any)?.SAR || (selectedService.price as any)?.USD) {
                    return backendCurrency === 'USD' ? 'السعر (USD)' : 'السعر (SAR)';
                  }
                  return 'السعر';
                })()}
              </p>
              {(selectedService.price?.currency === 'SAR' || ((selectedService.price as any)?.SAR && backendCurrency === 'SAR')) && (
                <p className="arabic-text" style={{ margin: "4px 0 0 0", fontSize: 11, color: "#f59e0b", fontWeight: 600 }}>
                  💳 سيتم تحويل السعر للدولار في PayPal
                </p>
              )}
            </div>
          </div>
          {isServiceLocked && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid #c7d2fe" }}>
              <p className="arabic-text" style={{ margin: 0, fontSize: 13, color: "#7c3aed", fontWeight: 600 }}>
                ✅ تم اختيار هذه الخدمة من صفحة التفاصيل
              </p>
              {onClearServiceSelection && (
                <button
                  type="button"
                  onClick={onClearServiceSelection}
                  className="arabic-text"
                  style={{ padding: "4px 8px", fontSize: 12, background: "transparent", color: "#ef4444", border: "1px solid #ef4444", borderRadius: 6, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#fef2f2"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "transparent"
                  }}
                >
                  تغيير الخدمة
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label className="arabic-text" htmlFor="service">
              الخدمة المطلوبة *
            </label>
            <button
              type="button"
              onClick={() => loadServices && loadServices()}
              className="arabic-text"
              style={{ 
                padding: "4px 8px", 
                fontSize: 12, 
                background: "#f1f5f9", 
                color: "#64748b", 
                border: "1px solid #e2e8f0", 
                borderRadius: 6, 
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#e2e8f0"
                e.currentTarget.style.color = "#475569"
                e.currentTarget.style.borderColor = "#cbd5e1"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#f1f5f9"
                e.currentTarget.style.color = "#64748b"
                e.currentTarget.style.borderColor = "#e2e8f0"
              }}
            >
              🔄 تحديث القائمة
            </button>
          </div>
          <select
            id="service"
            value={orderData.service}
            onChange={(e) => updateOrderData({ service: e.target.value })}
            disabled={isServiceLocked}
            style={{ 
              ...inputBase, 
              borderColor: errors.service ? "#ef4444" : "#e2e8f0",
              backgroundColor: isServiceLocked ? "#f8fafc" : "#ffffff",
              color: isServiceLocked ? "#64748b" : "#1f2937",
              cursor: isServiceLocked ? "not-allowed" : "pointer"
            }}
          >
            {!isServiceLocked && (
              <option value="" disabled>
                اختر الخدمة المطلوبة
              </option>
            )}
            {services.filter((s) => s.isActive).map((s) => (
              <option key={s._id} value={s._id}>
                {typeof s.title === 'object' ? ((s.title as any)?.ar || (s.title as any)?.en) : s.title} — {(() => {
                  if (s.price?.currency && s.price?.amount) {
                    return s.price.currency === 'USD' ? `$${s.price.amount}` : `${s.price.amount} ر.س`;
                  } else if ((s.price as any)?.SAR || (s.price as any)?.USD) {
                    return (s.price as any).SAR ? `${(s.price as any).SAR} ر.س` : `$${(s.price as any).USD}`;
                  }
                  return 'السعر غير متوفر';
                })()}
              </option>
            ))}
            {/* Ensure selected service appears even if it's not part of the mock list */}
            {selectedService && !services.some((s) => s._id === selectedService._id) && (
              <option value={selectedService._id}>
                {typeof selectedService.title === 'object' ? ((selectedService.title as any)?.ar || (selectedService.title as any)?.en) : selectedService.title} — {(() => {
                  if (selectedService.price?.currency && selectedService.price?.amount) {
                    return selectedService.price.currency === 'USD' ? `$${selectedService.price.amount}` : `${selectedService.price.amount} ر.س`;
                  } else if ((selectedService.price as any)?.SAR || (selectedService.price as any)?.USD) {
                    return (selectedService.price as any).SAR ? `${(selectedService.price as any).SAR} ر.س` : `$${(selectedService.price as any).USD}`;
                  }
                  return 'السعر غير متوفر';
                })()}
              </option>
            )}
          </select>
          {errors.service && <p className="arabic-text" style={{ color: "#ef4444", fontSize: 12 }}>{errors.service}</p>}
          
          {/* Info section about services loading */}
          {services.length === 0 && (
            <div style={{ marginTop: 8, padding: 8, background: "#fef3c7", borderRadius: 6, border: "1px solid #f59e0b" }}>
              <p className="arabic-text" style={{ margin: 0, fontSize: 12, color: "#92400e" }}>
                ⚠️ لا توجد خدمات متاحة حالياً. اضغط على "تحديث القائمة" لإعادة المحاولة.
              </p>
            </div>
          )}
          
          {selectedService && !isServiceLocked && (
            <div style={{ marginTop: 8, padding: 8, background: "#dbeafe", borderRadius: 6, border: "1px solid #3b82f6" }}>
              <p className="arabic-text" style={{ margin: 0, fontSize: 12, color: "#1e40af" }}>
                💡 <b>معلومة:</b> يمكنك تغيير الخدمة في أي وقت قبل الدفع
              </p>
            </div>
          )}
          
          {orderData.service && !selectedService && (
            <div style={{ marginTop: 8, padding: 8, background: "#fef2f2", borderRadius: 6, border: "1px solid #ef4444" }}>
              <p className="arabic-text" style={{ margin: 0, fontSize: 12, color: "#dc2626" }}>
                ❌ الخدمة المحددة غير متاحة. اختر خدمة أخرى أو اضغط "تحديث القائمة"
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="arabic-text" htmlFor="desc" style={{ display: "block", marginBottom: 6 }}>
            وصف مختصر للمشروع *
          </label>
          <textarea
            id="desc"
            value={orderData.description}
            onChange={(e) => updateOrderData({ description: e.target.value })}
            placeholder="اشرح تفاصيل مشروعك، الألوان المفضلة، الأسلوب المطلوب، والهدف من التصميم..."
            style={{ ...inputBase, minHeight: 120, borderColor: errors.description ? "#ef4444" : "#e2e8f0" }}
            maxLength={1000}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {errors.description && <p className="arabic-text" style={{ color: "#ef4444", fontSize: 12 }}>{errors.description}</p>}
            <p className="arabic-text" style={{ fontSize: 12, color: "#64748b" }}>{orderData.description.length}/1000 حرف</p>
          </div>
        </div>

        <div>
          <label className="arabic-text" htmlFor="notes" style={{ display: "block", marginBottom: 6 }}>
            ملاحظات أساسية (اختياري)
          </label>
          <textarea
            id="notes"
            value={orderData.notes}
            onChange={(e) => updateOrderData({ notes: e.target.value })}
            placeholder="ملاحظات أساسية حول المشروع..."
            style={{ ...inputBase, minHeight: 90 }}
            maxLength={500}
          />
          <p className="arabic-text" style={{ fontSize: 12, color: "#64748b" }}>{orderData.notes.length}/500 حرف</p>
        </div>


        {/* تم إزالة رفع الملفات بالكامل */}

        {/* تنبيه PayPal */}
        <div style={{ padding: 12, background: "#dbeafe", border: "1px solid #93c5fd", color: "#1e40af", borderRadius: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16 }}>💳</span>
            <b>معلومات الدفع - PayPal</b>
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.4 }}>
            • الدفع يتم عبر PayPal بالدولار الأمريكي (USD) فقط<br/>
            • الأسعار بالريال سيتم تحويلها تلقائياً للدولار<br/>
            • سعر التحويل حسب معدل PayPal الحالي
          </p>
        </div>

        <div style={{ padding: 12, background: "#fff7ed", border: "1px solid #fed7aa", color: "#b45309", borderRadius: 10 }}>
          <b>تنبيه مهم:</b> جميع المدفوعات غير قابلة للاسترداد. يرجى التأكد من تفاصيل طلبك قبل المتابعة للدفع.
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="arabic-text" 
          style={{ 
            width: "100%", 
            padding: "12px 16px", 
            borderRadius: 10, 
            background: isSubmitting ? "#94a3b8" : "#7c3aed", 
            color: "#fff", 
            fontWeight: 700,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            border: "none",
            position: "relative",
            zIndex: 9999
          }}
          onMouseOver={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.background = "#6d28d9"
              e.currentTarget.style.transform = "translateY(-1px)"
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(124, 58, 237, 0.3)"
            }
          }}
          onMouseOut={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.background = "#7c3aed"
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "none"
            }
          }}
        >
          {isSubmitting ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ 
                width: 16, 
                height: 16, 
                border: "2px solid #ffffff40", 
                borderTop: "2px solid #ffffff", 
                borderRadius: "50%", 
                animation: "spin 1s linear infinite" 
              }}>
              </span>
              جاري إنشاء الطلب...
            </span>
          ) : "متابعة للدفع"}
        </button>
        {submitError && (
          <div style={{ marginTop: 10, padding: 10, background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b' }}>
            <span className="arabic-text">
              {/* إصلاح عرض رسائل الأخطاء العربية */}
              {(() => {
                try {
                  if (submitError.includes('Ù') || submitError.includes('Ø') || submitError.includes('%')) {
                    return 'حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.';
                  }
                  return submitError;
                } catch (e) {
                  return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
                }
              })()}
            </span>
          </div>
        )}
      </form>
    </div>
  )
}

// ============ Payment Step ============
function PaymentStep({
  orderData,
  updateOrderData,
  nextStep,
  selectedService,
  isLoggedIn,
}: {
  orderData: StandaloneOrderData
  updateOrderData: (data: Partial<StandaloneOrderData>) => void
  nextStep: () => void
  selectedService: typeof MOCK_SERVICES[number] | null
  isLoggedIn: boolean
}) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { currency: currentCurrency, convert, format } = useCurrency()
  // Use SAR for backend currency to be compatible with legacy price shapes
  const backendCurrency: 'SAR' = 'SAR'
  const canPay = !!selectedService && !!orderData.email && !!orderData.phone && orderData.isVerified

  const baseAmount = (() => {
    if (!selectedService) return 0;
    const price = selectedService.price as any;
    if (price?.amount) {
      return price.amount;
    } else if (price?.SAR || price?.USD) {
      return price.SAR || price.USD || 0;
    }
    return 0;
  })();
  
  const baseCurr = (() => {
    if (!selectedService) return 'SAR';
    const price = selectedService.price as any;
    if (price?.currency) {
      return price.currency;
    } else if (price?.SAR) {
      return 'SAR';
    } else if (price?.USD) {
      return 'USD';
    }
    return 'SAR';
  })();
  const subtotal = convert(baseAmount, baseCurr as any)
  // ضريبة القيمة المضافة 15% لكل العملات (0% إذا كان subtotal = 0)
  const tax = subtotal > 0 ? Math.round(subtotal * 0.15 * 100) / 100 : 0
  const total = subtotal + tax

  const handlePayment = async () => {
    setIsProcessing(true)
    setError(null)
    
    // Require email verification for all users (even logged in users may use different email)
    if (!orderData.isVerified) {
      setIsProcessing(false)
      setError('يرجى إتمام التحقق من البريد الإلكتروني أولاً')
      return
    }
    
    try {
      // استرجاع بيانات الطلب المحفوظة محلياً
      const pendingOrderStr = localStorage.getItem('pendingOrder')
      if (!pendingOrderStr) {
        throw new Error('لا توجد بيانات طلب محفوظة')
      }
      
      const pendingOrder = JSON.parse(pendingOrderStr)
      
      // إنشاء جلسة الدفع مع البيانات المؤقتة (بدون إنشاء Order في الداتابيس)
      // Creating payment session
      
      const successUrl = typeof window !== 'undefined' ? `${window.location.origin}/order/success?session_id={CHECKOUT_SESSION_ID}` : undefined
      const cancelUrl = typeof window !== 'undefined' ? `${window.location.origin}/order/payment?canceled=1` : undefined
      
      // استخدام temporary order ID
      const tempOrderId = orderData.orderId || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const resp: any = await apiFetch<any>('/payment/create-session', {
        method: 'POST',
        body: JSON.stringify({ 
          orderId: tempOrderId,
          successUrl, 
          cancelUrl,
          // إرسال بيانات الطلب مع الطلب لإنشاؤها بعد نجاح الدفع
          orderData: {
            items: pendingOrder.items.map((item: any) => ({
              serviceId: item.serviceId,
              quantity: item.quantity || 1
            })),
            // استخدام البيانات المدخلة في النموذج وليس البيانات المحفوظة
            guestInfo: {
              name: orderData.name,
              email: orderData.email,
              phone: orderData.phone
            },
            currency: pendingOrder.currency,
            notes: pendingOrder.notes || '',
            description: pendingOrder.description || ''
          }
        }),
        auth: !!getToken()
      })
      
      const sessionUrl = resp?.data?.sessionUrl || resp?.sessionUrl
      if (!sessionUrl) throw new Error('تعذر إنشاء جلسة الدفع')
      
      // Payment session created, redirecting
      
      // Redirect to payment (Order سيتم إنشاؤه بعد نجاح الدفع)
      window.location.href = sessionUrl
      
    } catch (e: any) {
      const errorMessage = e?.message || 'فشل في إنشاء جلسة الدفع';
      setError(errorMessage.includes('Ù') || errorMessage.includes('Ø') 
        ? 'فشل في إنشاء طلب الدفع. يرجى المحاولة مرة أخرى.' 
        : errorMessage);
      setIsProcessing(false)
      return
    }
  }

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 20 }}>
      <h3 className="arabic-text" style={{ fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 4 }}>
        إتمام الدفع
      </h3>
      <p className="arabic-text" style={{ textAlign: "center", color: "#64748b", marginBottom: 16 }}>
        مراجعة الطلب وإتمام عملية الدفع
      </p>

      {error && (
        <div style={{ marginBottom: 12, padding: 12, borderRadius: 10, background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" }}>
          <span className="arabic-text">
            {/* إصلاح عرض رسائل الأخطاء العربية */}
            {(() => {
              try {
                // إذا كانت الرسالة مُرمزة، استبدلها برسالة صحيحة
                if (error.includes('Ù') || error.includes('Ø') || error.includes('%')) {
                  if (error.includes('PayPal') || error.includes('Ø¯ÙØ¹')) {
                    return 'فشل في إنشاء طلب الدفع عبر PayPal. يرجى المحاولة مرة أخرى.';
                  }
                  return 'حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.';
                }
                return error;
              } catch (e) {
                return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
              }
            })()}
          </span>
        </div>
      )}

      {/* Order Summary */}
      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <h4 className="arabic-text" style={{ fontWeight: 700 }}>ملخص الطلب</h4>
        <div style={{ background: "#f1f5f9", borderRadius: 10, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p className="arabic-text" style={{ fontWeight: 600 }}>{typeof selectedService?.title === 'object' ? ((selectedService?.title as any)?.ar || (selectedService?.title as any)?.en) : selectedService?.title || "خدمة"}</p>
              <p className="arabic-text" style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
                {orderData.description.slice(0, 100)}{orderData.description.length > 100 ? "..." : ""}
              </p>
            </div>
            <span className="arabic-text" style={{ background: "#e2e8f0", borderRadius: 8, padding: "4px 8px", fontSize: 14 }}>
              {format(subtotal)}
            </span>
          </div>
          {/* لا توجد ملفات مرفقة بعد إزالة ميزة الرفع */}
        </div>
      </div>

      {/* Price Breakdown */}
      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        <h4 className="arabic-text" style={{ fontWeight: 700 }}>تفاصيل السعر</h4>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="arabic-text">المبلغ الأساسي</span>
          <span>{format(subtotal)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="arabic-text">ضريبة القيمة المضافة (15%)</span>
          <span>{format(tax)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: 8, fontWeight: 700 }}>
          <span className="arabic-text">المجموع الكلي</span>
          <span>{format(total)}</span>
        </div>
      </div>

      {/* Customer Info */}
      <div style={{ display: "grid", gap: 4, marginBottom: 16 }}>
        <h4 className="arabic-text" style={{ fontWeight: 700 }}>معلومات العميل</h4>
        <div style={{ background: "#f1f5f9", borderRadius: 10, padding: 10 }}>
          <p className="arabic-text"><b>الاسم:</b> {orderData.name}</p>
          <p className="arabic-text"><b>البريد الإلكتروني:</b> {orderData.email}</p>
          <p className="arabic-text"><b>رقم الهاتف:</b> {orderData.phone}</p>
        </div>
      </div>

      {/* Non-refundable Warning */}
      <div style={{ padding: 12, background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 10, marginBottom: 12 }}>
        <b>تنبيه مهم:</b> جميع المدفوعات غير قابلة للاسترداد. بالمتابعة، أنت توافق على الشروط وسياسة عدم الاسترداد.
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={isProcessing || !canPay}
        className="arabic-text"
        style={{ 
          width: "100%", 
          padding: "14px 16px", 
          borderRadius: 10, 
          background: !canPay ? "#94a3b8" : "#0ea5e9", 
          color: "#fff", 
          fontWeight: 700,
          cursor: (!canPay || isProcessing) ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          position: "relative",
          zIndex: 9999
        }}
        onMouseOver={(e) => {
          if (canPay && !isProcessing) {
            e.currentTarget.style.background = "#0284c7"
            e.currentTarget.style.transform = "translateY(-1px)"
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(14, 165, 233, 0.3)"
          }
        }}
        onMouseOut={(e) => {
          if (canPay && !isProcessing) {
            e.currentTarget.style.background = "#0ea5e9"
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "none"
          }
        }}
      >
        {isProcessing ? (
          <>
            <span style={{ 
              width: 20, 
              height: 20, 
              border: "2px solid #ffffff40", 
              borderTop: "2px solid #ffffff", 
              borderRadius: "50%", 
              animation: "spin 1s linear infinite" 
            }}>
            </span>
            جاري المعالجة...
          </>
        ) : !selectedService ? (
          "يرجى اختيار خدمة أولاً"
        ) : !orderData.email || !orderData.phone ? (
          "يرجى إدخال البريد والهاتف"
        ) : !orderData.isVerified ? (
          "أكمل التحقق أولاً"
        ) : (
          <>
            💳 ادفع {format(total)}
          </>
        )}
      </button>

      {!selectedService && (
        <div style={{ marginTop: 8, padding: 12, background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 8 }}>
          <p className="arabic-text" style={{ color: "#92400e", fontSize: 14, textAlign: "center" }}>
            لم يتم العثور على تفاصيل الخدمة. يرجى العودة لصفحة الطلب واختيار خدمة.
          </p>
        </div>
      )}

      {orderData.isVerified && (
        <div style={{ marginTop: 8, padding: 12, background: "#d1fae5", border: "1px solid #86efac", borderRadius: 8 }}>
          <p className="arabic-text" style={{ color: "#047857", fontSize: 14, textAlign: "center" }}>
            ✅ تم التحقق من بريدك الإلكتروني. يمكنك المتابعة للدفع.
          </p>
        </div>
      )}

      {!orderData.isVerified && (
        <div style={{ marginTop: 8, padding: 12, background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 8 }}>
          <p className="arabic-text" style={{ color: "#991b1b", fontSize: 14, textAlign: "center" }}>
            📧 يرجى التحقق من بريدك الإلكتروني أولاً قبل المتابعة إلى الدفع.
          </p>
        </div>
      )}

    </div>
  )
}

// ============ Success Step ============
function SuccessStep({ orderData, whatsappLink, postPaymentMessage }: { orderData: StandaloneOrderData; whatsappLink?: string; postPaymentMessage?: string }) {
  // حل مضمون 100% - استخدم رقم الطلب مباشرة من البيانات الموجودة
  const getOrderNumber = () => {
    if (orderData.orderId) {
      // استخدم آخر 8 أرقام من المعرف كرقم طلب
      return orderData.orderId.slice(-8)
    } else {
      // في أسوأ الحالات، استخدم timestamp
      return Date.now().toString().slice(-6)
    }
  }

  const orderNumber = getOrderNumber()
  // Order processing completed

  const copyId = () => navigator.clipboard.writeText(orderNumber || "")

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 20, textAlign: "center" }}>
      <div style={{ width: 64, height: 64, background: "#dcfce7", color: "#16a34a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>✔</div>
      <h3 className="arabic-text" style={{ fontSize: 22, fontWeight: 700, color: "#16a34a" }}>تم الدفع بنجاح!</h3>
      <p className="arabic-text" style={{ color: "#64748b", marginBottom: 16 }}>شكراً لك! تم استلام طلبك وسنبدأ العمل عليه قريباً</p>

      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        <p className="arabic-text" style={{ fontWeight: 700 }}>رقم طلبك</p>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
          <code style={{ fontSize: 20, background: "#eef2ff", color: "#4f46e5", padding: "8px 14px", borderRadius: 8 }}>
            #{orderNumber}
          </code>
          <button 
            onClick={copyId} 
            style={{ 
              border: "1px solid #e2e8f0", 
              padding: "6px 8px", 
              borderRadius: 8,
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: "white"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#f8fafc"
              e.currentTarget.style.borderColor = "#cbd5e1"
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "white"
              e.currentTarget.style.borderColor = "#e2e8f0"
            }}
          >
            نسخ
          </button>
        </div>
        <p className="arabic-text" style={{ fontSize: 12, color: "#64748b" }}>
          احتفظ برقم الطلب للمراجعة {orderData.orderId && `(ID: ${orderData.orderId.slice(-8)})`}
        </p>
      </div>

      <div style={{ textAlign: "right", background: "#f1f5f9", borderRadius: 10, padding: 12, marginBottom: 16 }}>
        <p className="arabic-text" style={{ fontWeight: 700 }}>ملخص الطلب</p>
        <div style={{ fontSize: 14, display: "grid", gap: 4 }}>
          <p className="arabic-text"><b>الخدمة:</b> {orderData.serviceTitle || orderData.service || "—"}</p>
          <p className="arabic-text"><b>العميل:</b> {orderData.name}</p>
          <p className="arabic-text"><b>التواصل:</b> {orderData.contact}</p>
          {/* لا يوجد عرض للملفات بعد الإزالة */}
        </div>
      </div>

      {postPaymentMessage && (
        <div style={{ marginBottom: 12, padding: 12, background: "#eef2ff", border: "1px solid #c7d2fe", color: "#3730a3", borderRadius: 10 }}>
          <p className="arabic-text" style={{ margin: 0 }}>{postPaymentMessage}</p>
        </div>
      )}

      {whatsappLink && (
        <a 
          href={whatsappLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="arabic-text" 
          style={{ 
            display: "inline-block", 
            padding: "10px 12px", 
            borderRadius: 10, 
            background: "#22c55e", 
            color: "#fff", 
            marginBottom: 12,
            textDecoration: "none",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#16a34a"
            e.currentTarget.style.transform = "translateY(-1px)"
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(34, 197, 94, 0.3)"
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#22c55e"
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          📱 تواصل عبر واتساب
        </a>
      )}

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <a 
          href="/services" 
          className="arabic-text" 
          style={{ 
            display: "inline-block", 
            padding: "12px 16px", 
            borderRadius: 10, 
            background: "#7c3aed", 
            color: "#fff", 
            fontWeight: 700, 
            textDecoration: "none",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#6d28d9"
            e.currentTarget.style.transform = "translateY(-1px)"
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(124, 58, 237, 0.3)"
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#7c3aed"
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          🛒 اطلب خدمة أخرى
        </a>
        <a 
          href="/" 
          className="arabic-text" 
          style={{ 
            display: "inline-block", 
            padding: "12px 16px", 
            borderRadius: 10, 
            border: "1px solid #e2e8f0", 
            textDecoration: "none",
            transition: "all 0.2s ease",
            background: "white"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#f8fafc"
            e.currentTarget.style.borderColor = "#cbd5e1"
            e.currentTarget.style.transform = "translateY(-1px)"
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "white"
            e.currentTarget.style.borderColor = "#e2e8f0"
            e.currentTarget.style.transform = "translateY(0)"
          }}
        >
          🏠 العودة للصفحة الرئيسية
        </a>
      </div>
    </div>
  )
}
