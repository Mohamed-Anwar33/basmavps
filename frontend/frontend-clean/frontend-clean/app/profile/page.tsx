"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { OrderDetailsModal } from "@/components/OrderDetailsModal"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { apiFetch, getToken, getUser } from "@/lib/api"
import { useToastContext } from "@/contexts/toast-context"
import { ArrowLeft, Eye, Calendar, CreditCard, Package, User, Mail, Phone, FileText, Clock, CheckCircle2, MessageCircle, Paperclip, Download, ExternalLink } from "lucide-react"

interface OrderType {
  _id: string
  orderNumber: string
  serviceId?: string
  notes?: string
  description?: string
  additionalNotes?: string
  attachments?: Array<{
    filename: string
    originalName: string
    url: string
    cloudinaryId: string
    fileType: 'image' | 'document' | 'pdf'
    size: number
    uploadedAt: string
  }>
  amount?: number
  currency?: string
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  status: string
  createdAt: string
  customerName?: string
  email?: string
  phone?: string
  deliveryAvailable?: boolean
  deliveryLinks?: Array<{ url: string; title?: string; locale?: string; tags?: string[] }>
  deliveryEmailSent?: boolean
  deliveredAt?: string
  guestInfo?: {
    name?: string
    email?: string
    phone?: string
  }
}

interface ServiceLite {
  _id: string
  title?: { ar?: string; en?: string } | string
  description?: { ar?: string; en?: string } | string
  price?: any
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToastContext()
  const [me, setMe] = useState<{ name: string; email: string; phone?: string } | null>(null)
  const [orders, setOrders] = useState<OrderType[]>([])
  const [servicesMap, setServicesMap] = useState<Record<string, ServiceLite>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastSnapshot = useRef<Record<string, { paymentStatus: string; status: string; deliveryEmailSent?: boolean; deliveredAt?: string }>>({})
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)


  useEffect(() => {
    const token = getToken()
    const user = getUser()
    if (!token || !user) {
      router.push("/login")
      return
    }

    setLoading(true)
    const load = async (showDiffToasts = false) => {
      try {
        // Load me
        const meRes = await apiFetch<{ success: boolean; data: { user: any } } | { user: any }>("/auth/me", { auth: true })
        const userData = (meRes as any)?.data?.user || (meRes as any)?.user || {}
        setMe({ name: userData?.name || "", email: userData?.email || "", phone: userData?.phone || "" })

        // Load my orders
        const or = await apiFetch<any>("/orders/my", { auth: true })
        const rawOrders: any[] = (or as any)?.data?.orders || (or as any)?.orders || []
        
        
        // Load services to get proper service names
        try {
          const servicesRes = await apiFetch<any>("/services", { auth: false })
          const services: any[] = (servicesRes as any)?.data?.services || (servicesRes as any)?.services || []
          const serviceMap: Record<string, ServiceLite> = {}
          services.forEach((service: any) => {
            serviceMap[service._id] = {
              _id: service._id,
              title: service.title,
              description: service.description,
              price: service.price
            }
          })
          setServicesMap(serviceMap)
        } catch (error) {
        }

        // Map backend order shape to UI OrderType
        const list: OrderType[] = rawOrders.map((od: any) => {
          const firstItem = Array.isArray(od.items) && od.items[0] ? od.items[0] : null
          const svc = firstItem?.serviceId
          const serviceId = typeof svc === 'string' ? svc : (svc?._id || undefined)
          // Get payment status from order paymentStatus field (more reliable)
          const paymentStatus: OrderType['paymentStatus'] = od.paymentStatus === 'paid' 
            ? 'paid'
            : (od.paymentStatus === 'refunded' ? 'refunded' : 
               (od.payment?.status === 'succeeded' ? 'paid' : 'pending'))
          const deliveryLinks = Array.isArray(od.deliveryLinks) ? od.deliveryLinks.map((l: any) => ({ url: l?.url || String(l), title: l?.title })) : []
          
          // Debug logging for ALL orders to see what's happening
          // Order data processed successfully
          return {
            _id: od._id,
            orderNumber: od.orderNumber || '',
            serviceId,
            notes: od.notes || '',
            description: od.description || '',
            additionalNotes: od.additionalNotes || '',
            attachments: Array.isArray(od.attachments) ? od.attachments : [],
            amount: od.total,
            currency: od.currency,
            paymentStatus,
            status: od.status,
            // حفظ بيانات الدفع والتسجيل منفصلة للعرض
            paymentContactInfo: od.guestInfo ? {
              name: od.guestInfo.name || '',
              email: od.guestInfo.email || '',
              phone: od.guestInfo.phone || ''
            } : null,
            // بيانات التواصل المعروضة (أولوية للدفع)
            email: od.guestInfo?.email || od.email || '',
            phone: od.guestInfo?.phone || od.phone || '',
            customerName: od.guestInfo?.name || od.customerName || '',
            createdAt: od.createdAt,
            deliveryEmailSent: od.deliveryEmailSent,
            deliveredAt: od.deliveredAt,
            deliveryLinks,
            deliveryAvailable: paymentStatus === 'paid' && deliveryLinks.length > 0,
            // الاحتفاظ بـ guestInfo الكاملة لعرضها في المودال
            guestInfo: od.guestInfo || {}
          }
        })

        if (showDiffToasts) {
          // Compare with last snapshot and toast on changes
          list.forEach((o) => {
            const prev = lastSnapshot.current[o._id]
            if (!prev) return
            if (prev.paymentStatus !== o.paymentStatus) {
              toast({ title: "تحديث حالة الدفع", description: o.paymentStatus === 'paid' ? `تم تأكيد الدفع لطلب ${o.orderNumber}` : `تغيّرت حالة الدفع إلى ${statusText(o.paymentStatus)}` , variant: o.paymentStatus === 'paid' ? 'success' : 'warning' })
            }
            if (prev.status !== o.status) {
              toast({ title: "تحديث حالة التنفيذ", description: `حالة الطلب ${o.orderNumber} أصبحت: ${fulfillmentText(o.status)}`, variant: o.status === 'completed' ? 'success' : 'default' })
            }
            if (!prev.deliveryEmailSent && o.deliveryEmailSent) {
              toast({ title: "تم إرسال التسليم", description: `تم إرسال روابط التسليم لطلب ${o.orderNumber} إلى بريدك`, variant: 'success' })
            }
          })
        }

        // Pre-populate servicesMap from populated order items if available
        const preMap: Record<string, ServiceLite> = {}
        rawOrders.forEach((od: any) => {
          const firstItem = Array.isArray(od.items) && od.items[0] ? od.items[0] : null
          const svcDoc = firstItem && typeof firstItem.serviceId === 'object' ? firstItem.serviceId : null
          if (svcDoc && svcDoc._id) {
            preMap[svcDoc._id] = {
              _id: svcDoc._id,
              title: svcDoc.title,
              description: svcDoc.description,
            }
          }
        })

        // Update state
        setOrders(list)
        setLastUpdatedAt(new Date())
        // Update snapshot
        const snap: Record<string, { paymentStatus: string; status: string; deliveryEmailSent?: boolean; deliveredAt?: string }> = {}
        list.forEach((o) => { snap[o._id] = { paymentStatus: o.paymentStatus, status: o.status, deliveryEmailSent: o.deliveryEmailSent, deliveredAt: o.deliveredAt } })
        lastSnapshot.current = snap

        // Load services referenced
        const ids = Array.from(new Set(list.map(o => o.serviceId).filter(Boolean) as string[]))
        const map: Record<string, ServiceLite> = { ...preMap }
        // Fetch missing ones by slug if needed (best effort); skip if already in map
        await Promise.all(ids
          .filter(id => !(id in map))
          .map(async (id) => {
            try {
              // Backend expects slug; we don't have it here reliably, so skip network for now
              // Leave mapping as pre-populated; UI will still show core order fields
              return
            } catch {}
          }))
        setServicesMap(map)
      } catch (e: any) {
        if (e?.message?.includes('Authentication required') || e?.message?.includes('401')) {
          // Token is invalid, redirect to login
          router.push("/login")
          return
        }
        // تحسين رسائل الخطأ
        if (e?.message?.includes('Authentication required') || e?.message?.includes('401') || e?.message?.includes('Invalid or expired token')) {
          setError('session_expired')
        } else {
          setError(e?.message || "تعذر تحميل بيانات الحساب")
        }
      } finally {
        setLoading(false)
      }
    }

    // initial load
    load(false)
    // periodic refresh
    const id = setInterval(() => load(true), 15000)
    return () => clearInterval(id)
  }, [router, toast])

  const whatsappLink = "https://wa.me/966XXXXXXXXX"
  const lastUpdatedLabel = useMemo(() => lastUpdatedAt ? new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(lastUpdatedAt) : '—', [lastUpdatedAt])

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50/30">
      <Header />
      <main className="pt-28 pb-16 relative z-20">
        <div className="container mx-auto px-4 max-w-6xl relative z-20">
          {/* Header Card */}
          <Card className="mb-8 overflow-hidden border-violet-200/70 shadow-sm relative z-30">
            <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white p-6">
              <CardTitle className="text-2xl md:text-3xl arabic-text">الملف الشخصي</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="arabic-text text-muted-foreground">الاسم</p>
                <p className="arabic-text text-xl font-semibold">{me?.name || "—"}</p>
              </div>
              <div>
                <p className="arabic-text text-muted-foreground">البريد الإلكتروني</p>
                <p className="arabic-text text-xl font-semibold">{me?.email || "—"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Orders */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold arabic-text text-primary">طلباتي</h2>
              <Button asChild variant="outline" className="arabic-text border-primary text-primary hover:bg-primary hover:text-white">
                <a href="/services" className="flex items-center gap-2"><ArrowLeft className="h-4 w-4 rtl-flip"/> اطلب خدمة جديدة</a>
              </Button>
            </div>

            {loading && (
              <Card><CardContent className="p-6 arabic-text">جاري التحميل...</CardContent></Card>
            )}
            {error && (
              <>
                {error === 'session_expired' ? (
                  <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                    <CardContent className="p-8 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                          <span className="text-3xl">🔐</span>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-amber-800 arabic-text">انتهت صلاحية الجلسة</h3>
                          <p className="text-amber-700 arabic-text leading-relaxed">
                            لحماية حسابك، انتهت صلاحية جلسة تسجيل الدخول الخاصة بك.
                            <br />
                            يرجى تسجيل الدخول مرة أخرى للوصول إلى طلباتك.
                          </p>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <Button 
                            asChild 
                            className="bg-primary hover:bg-primary/90 text-white arabic-text px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <a href="/login" className="flex items-center gap-2">
                              🔑 تسجيل الدخول
                            </a>
                          </Button>
                          <Button 
                            variant="outline" 
                            asChild 
                            className="border-amber-300 text-amber-700 hover:bg-amber-50 arabic-text px-6 py-2 rounded-lg"
                          >
                            <a href="/" className="flex items-center gap-2">
                              🏠 الصفحة الرئيسية
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
                    <CardContent className="p-8 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-3xl">⚠️</span>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-red-800 arabic-text">حدث خطأ في التحميل</h3>
                          <p className="text-red-700 arabic-text leading-relaxed">
                            {error}
                          </p>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <Button 
                            onClick={() => window.location.reload()}
                            className="bg-red-600 hover:bg-red-700 text-white arabic-text px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            🔄 إعادة المحاولة
                          </Button>
                          <Button 
                            variant="outline" 
                            asChild 
                            className="border-red-300 text-red-700 hover:bg-red-50 arabic-text px-6 py-2 rounded-lg"
                          >
                            <a href="/" className="flex items-center gap-2">
                              🏠 الصفحة الرئيسية
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
            {!loading && !error && (
              <div>
                {orders.length === 0 ? (
                  <Card className="text-center py-12 border-dashed">
                    <CardContent>
                      <p className="arabic-text text-muted-foreground mb-4">لا توجد طلبات حتى الآن</p>
                      <Button asChild className="arabic-text">
                        <a href="/services">اطلب خدمة جديدة</a>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {orders.map((o) => {
                      const svc = servicesMap[o.serviceId || '']
                      const paid = o.paymentStatus === 'paid'
                      
                      
                      // تحسين عرض اسم الخدمة مع معالجة أفضل للـ object titles
                      let serviceName = 'طلب خدمة'
                      if (svc?.title) {
                        if (typeof svc.title === 'string') {
                          serviceName = svc.title
                        } else if (typeof svc.title === 'object') {
                          // معالجة الـ title كـ object مع ar/en
                          serviceName = (svc.title as any)?.ar || (svc.title as any)?.en || 'خدمة غير محددة'
                        }
                      } else if (o.description && o.description.trim()) {
                        serviceName = o.description.length > 30 ? o.description.substring(0, 30) + '...' : o.description
                      } else if (o.notes && o.notes.trim()) {
                        serviceName = o.notes.length > 30 ? o.notes.substring(0, 30) + '...' : o.notes
                      }
                      
                      
                      return (
                        <Card key={o._id} className="hover:shadow-md transition-shadow border-r-4 border-r-primary/20 hover:border-r-primary/60">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3 items-center min-w-0">
                                {/* Order Number */}
                                <div className="flex items-center gap-2 min-w-0">
                                  <Package className="h-4 w-4 text-primary flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground arabic-text">رقم الطلب</p>
                                    <p className="font-semibold arabic-text truncate">#{(() => {
                                      if (o.orderNumber) return o.orderNumber
                                      if (o._id) return o._id.slice(-8)
                                      return Date.now().toString().slice(-6)
                                    })()}</p>
                                  </div>
                                </div>
                                
                                {/* Service Name */}
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs text-muted-foreground arabic-text">الخدمة</p>
                                    <p className="font-medium arabic-text truncate text-sm leading-tight" title={serviceName}>{serviceName}</p>
                                  </div>
                                </div>
                                
                                {/* Order Status */}
                                <div className="flex items-center gap-2 min-w-0">
                                  {(() => {
                                    const orderStatus = o.status || 'pending';
                                    const statusConfig: Record<string, { color: string; text: string; variant: 'default' | 'secondary' | 'destructive' }> = {
                                      'pending': { color: 'bg-yellow-500', text: 'في الانتظار', variant: 'secondary' },
                                      'in_progress': { color: 'bg-blue-500', text: 'قيد التنفيذ', variant: 'default' },
                                      'completed': { color: 'bg-green-500', text: 'مكتمل', variant: 'default' },
                                      'delivered': { color: 'bg-green-600', text: 'تم التسليم', variant: 'default' },
                                      'cancelled': { color: 'bg-red-500', text: 'ملغي', variant: 'destructive' }
                                    };
                                    const config = statusConfig[orderStatus] || statusConfig['pending'];
                                    
                                    return (
                                      <>
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${config.color}`} />
                                        <div className="min-w-0">
                                          <p className="text-xs text-muted-foreground arabic-text">حالة الطلب</p>
                                          <Badge variant={config.variant} className="arabic-text text-xs whitespace-nowrap">
                                            {config.text}
                                          </Badge>
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                                
                                {/* Payment Status */}
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    paid ? 'bg-green-500' : 
                                    o.paymentStatus === 'failed' ? 'bg-red-500' : 
                                    'bg-amber-500'
                                  }`} />
                                  <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground arabic-text">حالة الدفع</p>
                                    <Badge 
                                      variant={
                                        paid ? "default" : 
                                        o.paymentStatus === 'failed' ? "destructive" : 
                                        "secondary"
                                      } 
                                      className="arabic-text text-xs whitespace-nowrap"
                                    >
                                      {statusText(o.paymentStatus)}
                                    </Badge>
                                  </div>
                                </div>
                                
                                {/* Date */}
                                <div className="flex items-center gap-2 min-w-0">
                                  <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground arabic-text">تاريخ الإنشاء</p>
                                    <p className="text-sm arabic-text truncate">{new Date(o.createdAt).toLocaleDateString('ar-SA')}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex flex-col gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="arabic-text flex items-center gap-2"
                                  onClick={() => {
                                    setSelectedOrder(o)
                                    setIsModalOpen(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                  عرض الطلب
                                </Button>
                                
                                {/* روابط التسليم أو زر التحديث */}
                                {o.deliveryAvailable && o.deliveryLinks && o.deliveryLinks.length > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    <p className="text-xs text-green-700 arabic-text font-medium">✅ تم التسليم</p>
                                    {o.deliveryLinks.slice(0, 2).map((link, index) => (
                                      <Button
                                        key={index}
                                        variant="default"
                                        size="sm"
                                        className="arabic-text flex items-center gap-2 bg-green-600 hover:bg-green-700 text-xs"
                                        onClick={() => window.open(link.url, '_blank')}
                                      >
                                        <Download className="h-3 w-3" />
                                        {link.title || `رابط ${index + 1}`}
                                      </Button>
                                    ))}
                                    {o.deliveryLinks.length > 2 && (
                                      <p className="text-xs text-green-600 arabic-text">+{o.deliveryLinks.length - 2} روابط أخرى</p>
                                    )}
                                  </div>
                                ) : o.paymentStatus === 'pending' ? (
                                  <div className="arabic-text text-amber-600 text-xs font-medium">
                                    في انتظار الدفع
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* New Order Details Modal */}
            <OrderDetailsModal 
              isOpen={isModalOpen}
              onOpenChange={setIsModalOpen}
              order={selectedOrder}
              serviceName={(() => {
                if (!selectedOrder) return ''
                const svc = servicesMap[selectedOrder.serviceId || '']
                if (svc?.title) {
                  return (typeof svc.title === 'string') ? svc.title : (svc.title as any)?.ar || 'خدمة غير محددة'
                }
                if (selectedOrder.description && selectedOrder.description.trim()) {
                  return selectedOrder.description
                }
                if (selectedOrder.notes && selectedOrder.notes.trim()) {
                  return selectedOrder.notes
                }
                return 'طلب خدمة'
              })()}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// Helper functions for status display
function statusText(s: string) {
  switch (s) {
    case 'paid': return 'مدفوع ✅'
    case 'pending': return 'في انتظار الدفع 💳'
    case 'failed': return 'فشل الدفع ❌'
    case 'refunded': return 'مسترد 💰'
    case 'succeeded': return 'مدفوع ✅'
    case 'pending_webhook_verification': return 'قيد التحقق ⏳'
    default: return 'غير معروف ❓'
  }
}

function fulfillmentText(s: string) {
  switch (s) {
    case 'new': return 'جديد'
    case 'in_progress': return 'قيد التنفيذ'
    case 'completed': return 'مكتمل'
    case 'cancelled': return 'ملغي'
    default: return 'غير معروف'
  }
}
