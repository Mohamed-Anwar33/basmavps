"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, User, Mail, Phone, Calendar, CreditCard, ExternalLink, FileText, Clock, CheckCircle2, MessageCircle } from "lucide-react"

interface OrderDetailsModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  order: OrderType | null
  serviceName: string
}

interface OrderType {
  _id: string
  orderNumber: string
  serviceId?: string
  notes?: string
  description?: string
  additionalNotes?: string
  amount?: number
  currency?: string
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  status: string
  createdAt: string
  customerName?: string
  email?: string
  phone?: string
  deliveryLinks?: Array<{ url: string; title?: string }>
  guestInfo?: {
    name?: string
    email?: string  
    phone?: string
  }
}

export function OrderDetailsModal({ isOpen, onOpenChange, order, serviceName }: OrderDetailsModalProps) {
  if (!order) return null

  // Debug logging للتحقق من البيانات (development only)
  if (process.env.NODE_ENV === 'development') {
    // Order data processed successfully
  }

  // فصل بيانات الدفع وبيانات تسجيل المستخدم
  const paymentContactInfo = {
    name: order.guestInfo?.name || 'غير محدد',
    email: order.guestInfo?.email || 'غير محدد', 
    phone: order.guestInfo?.phone || 'غير محدد'
  }
  
  const accountContactInfo = {
    name: order.customerName || 'غير محدد',
    email: order.email || 'غير محدد', 
    phone: order.phone || 'غير محدد'
  }

  // State variables
  const isPaid = order.paymentStatus === 'paid'
  const hasDeliveryLinks = order.deliveryLinks && order.deliveryLinks.length > 0
  
  // التحقق من وجود اختلاف بين البيانات
  const hasPaymentData = order.guestInfo && (order.guestInfo.name || order.guestInfo.email || order.guestInfo.phone)
  const hasAccountData = order.customerName || order.email || order.phone
  const isDifferent = hasPaymentData && hasAccountData && (
    paymentContactInfo.name !== accountContactInfo.name ||
    paymentContactInfo.email !== accountContactInfo.email ||
    paymentContactInfo.phone !== accountContactInfo.phone
  )

  // تحسين عرض وصف المشروع والملاحظات
  const projectDescription = order.description || order.notes || 'لا يوجد وصف محدد';
  const additionalNotes = order.additionalNotes || '';



  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'refunded':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'مدفوع ✅'
      case 'pending': return 'في انتظار الدفع 💳'
      case 'failed': return 'فشل الدفع ❌'
      case 'refunded': return 'مسترد 💰'
      default: return 'غير معروف'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'failed':
        return <span className="text-red-600 text-lg">❌</span>
      default:
        return <Clock className="h-5 w-5 text-amber-600" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="arabic-text text-xl flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            تفاصيل الطلب {order?.orderNumber && `#${order.orderNumber}`}
          </DialogTitle>
          <DialogDescription className="arabic-text text-sm text-muted-foreground">
            عرض تفاصيل الطلب ومعلومات الدفع والخدمة المطلوبة
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Status Header */}
          <Card className={`border-2 ${isPaid ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(order.paymentStatus)}
                  <div>
                    <h3 className="arabic-text font-bold text-lg">
                      #{(() => {
                        if (order.orderNumber) return order.orderNumber
                        if (order._id) return order._id.slice(-8)
                        return Date.now().toString().slice(-6)
                      })()}
                    </h3>
                    <p className="arabic-text text-sm text-muted-foreground">
                      {isPaid ? 'تم الدفع بنجاح وجاري العمل على طلبك' : 'في انتظار إتمام عملية الدفع'}
                    </p>
                  </div>
                </div>
                <Badge className={`${getStatusBadgeStyle(order.paymentStatus)} arabic-text font-medium px-4 py-2`}>
                  {getStatusText(order.paymentStatus)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Service Information */}
            <Card>
              <CardHeader>
                <CardTitle className="arabic-text text-base flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  معلومات الخدمة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailRow 
                  label="اسم الخدمة" 
                  value={serviceName || 'طلب خدمة'}
                  icon={<FileText className="h-4 w-4 text-primary" />}
                />
                {/* وصف المشروع */}
                <DetailRow 
                  label="وصف المشروع" 
                  value={projectDescription}
                  multiline={true}
                  icon={<FileText className="h-4 w-4 text-primary" />}
                />
                {/* ملاحظات أساسية */}
                {order.notes && order.notes !== projectDescription && (
                  <DetailRow 
                    label="ملاحظات أساسية" 
                    value={order.notes}
                    multiline={true}
                    icon={<FileText className="h-4 w-4 text-purple-600" />}
                  />
                )}
                {/* ملاحظات إضافية */}
                {additionalNotes && (
                  <DetailRow 
                    label="ملاحظات إضافية" 
                    value={additionalNotes}
                    multiline={true}
                    icon={<MessageCircle className="h-4 w-4 text-green-600" />}
                  />
                )}
                <DetailRow 
                  label="قيمة الطلب" 
                  value={order.amount ? `${order.amount} ${order.currency || 'SAR'}` : 'غير محدد'}
                  icon={<CreditCard className="h-4 w-4 text-green-600" />}
                />
              </CardContent>
            </Card>
            
            {/* كارد منفصلة للنصوص الطويلة */}
            {(projectDescription.length > 150 || (additionalNotes && additionalNotes.length > 150) || (order.notes && order.notes !== projectDescription && order.notes.length > 150)) && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="arabic-text text-base flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    تفاصيل المشروع والملاحظات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* وصف المشروع في مساحة كاملة */}
                  {projectDescription.length > 150 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <h4 className="arabic-text font-semibold text-blue-800">وصف المشروع</h4>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="arabic-text text-sm leading-relaxed whitespace-pre-wrap break-words text-blue-900">
                          {projectDescription}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* ملاحظات أساسية في مساحة كاملة */}
                  {order.notes && order.notes !== projectDescription && order.notes.length > 150 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <h4 className="arabic-text font-semibold text-purple-800">ملاحظات أساسية</h4>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="arabic-text text-sm leading-relaxed whitespace-pre-wrap break-words text-purple-900">
                          {order.notes}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* ملاحظات إضافية في مساحة كاملة */}
                  {additionalNotes && additionalNotes.length > 150 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        <h4 className="arabic-text font-semibold text-green-800">ملاحظات إضافية</h4>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="arabic-text text-sm leading-relaxed whitespace-pre-wrap break-words text-green-900">
                          {additionalNotes}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact Information - بيانات منفصلة */}
            {hasPaymentData && (
              <Card>
                <CardHeader>
                  <CardTitle className="arabic-text text-base flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    بيانات التواصل من نموذج الطلب 
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      ✅ أثناء عملية الدفع
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DetailRow 
                    label="اسم العميل" 
                    value={paymentContactInfo.name}
                    icon={<User className="h-4 w-4 text-green-600" />}
                  />
                  <DetailRow 
                    label="البريد الإلكتروني" 
                    value={paymentContactInfo.email}
                    icon={<Mail className="h-4 w-4 text-green-600" />}
                    copyable={true}
                  />
                  <DetailRow 
                    label="رقم الهاتف" 
                    value={paymentContactInfo.phone}
                    icon={<Phone className="h-4 w-4 text-green-600" />}
                    copyable={true}
                  />
                </CardContent>
              </Card>
            )}

            {isDifferent && hasAccountData && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="arabic-text text-base flex items-center gap-2">
                    <User className="h-5 w-5 text-amber-600" />
                    بيانات تسجيل الحساب
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                      📝 حساب مسجل في الموقع
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DetailRow 
                    label="اسم الحساب" 
                    value={accountContactInfo.name}
                    icon={<User className="h-4 w-4 text-amber-600" />}
                  />
                  <DetailRow 
                    label="إيميل الحساب" 
                    value={accountContactInfo.email}
                    icon={<Mail className="h-4 w-4 text-amber-600" />}
                    copyable={true}
                  />
                  <DetailRow 
                    label="هاتف الحساب" 
                    value={accountContactInfo.phone}
                    icon={<Phone className="h-4 w-4 text-amber-600" />}
                    copyable={true}
                  />
                </CardContent>
              </Card>
            )}

            {!hasPaymentData && hasAccountData && (
              <Card>
                <CardHeader>
                  <CardTitle className="arabic-text text-base flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    بيانات التواصل
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      من الحساب المسجل
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DetailRow 
                    label="اسم العميل" 
                    value={accountContactInfo.name}
                    icon={<User className="h-4 w-4 text-blue-600" />}
                  />
                  <DetailRow 
                    label="البريد الإلكتروني" 
                    value={accountContactInfo.email}
                    icon={<Mail className="h-4 w-4 text-blue-600" />}
                    copyable={true}
                  />
                  <DetailRow 
                    label="رقم الهاتف" 
                    value={accountContactInfo.phone}
                    icon={<Phone className="h-4 w-4 text-blue-600" />}
                    copyable={true}
                  />
                </CardContent>
              </Card>
            )}

            {/* Order Status & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="arabic-text text-base flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  معلومات الطلب
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailRow 
                  label="تاريخ إنشاء الطلب" 
                  value={new Date(order.createdAt).toLocaleString('ar-SA', {
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  icon={<Calendar className="h-4 w-4 text-purple-600" />}
                />
                <DetailRow 
                  label="حالة الدفع" 
                  value={getStatusText(order.paymentStatus)}
                  badge={true}
                  badgeStyle={getStatusBadgeStyle(order.paymentStatus)}
                />
                <DetailRow 
                  label="معرف الطلب" 
                  value={order._id}
                  copyable={true}
                  className="font-mono text-xs"
                />
              </CardContent>
            </Card>

            {/* Delivery Links - إذا كان مدفوع وفيه روابط */}
            {hasDeliveryLinks && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="arabic-text text-base flex items-center gap-2 text-green-800">
                    <ExternalLink className="h-5 w-5" />
                    روابط التسليم ({order.deliveryLinks!.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.deliveryLinks!.map((link, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-between arabic-text border-green-300 hover:bg-green-100"
                        onClick={() => window.open(link.url, '_blank')}
                      >
                        <span>{link.title || `رابط ${index + 1}`}</span>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-green-700 mt-3 arabic-text">
                    ✅ تم تسليم الخدمة بنجاح. يمكنك الوصول للملفات من خلال الروابط أعلاه.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="arabic-text"
            >
              إغلاق
            </Button>
            {(paymentContactInfo.email !== 'غير محدد' || accountContactInfo.email !== 'غير محدد') && (
              <Button 
                variant="default"
                onClick={() => {
                  const emailToUse = paymentContactInfo.email !== 'غير محدد' ? paymentContactInfo.email : accountContactInfo.email
                  const orderNum = order.orderNumber || order._id?.slice(-8) || Date.now().toString().slice(-6)
                  const subject = encodeURIComponent(`استفسار حول الطلب ${orderNum}`)
                  const body = encodeURIComponent(`مرحباً،\n\nأرغب في الاستفسار حول طلبي رقم ${orderNum}\n\nشكراً لكم`)
                  window.open(`mailto:${emailToUse}?subject=${subject}&body=${body}`)
                }}
                className="arabic-text"
              >
                <Mail className="h-4 w-4 ml-2" />
                مراسلة الدعم
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// DetailRow Component
interface DetailRowProps {
  label: string
  value: string
  icon?: React.ReactNode
  multiline?: boolean
  copyable?: boolean
  badge?: boolean
  badgeStyle?: string
  className?: string
}

function DetailRow({ label, value, icon, multiline = false, copyable = false, badge = false, badgeStyle, className }: DetailRowProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    // يمكن إضافة toast notification هنا
  }

  // إذا كان النص طويل جداً (أكثر من 150 حرف)، قلل حجم عرضه في الـ compact mode
  const isLongText = value.length > 150
  const shouldTruncateInCompact = isLongText && !multiline

  return (
    <div className="flex items-start gap-3">
      {icon && <div className="mt-1 text-muted-foreground flex-shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground arabic-text font-medium">{label}</p>
        <div className="mt-1">
          {badge ? (
            <div className="flex items-center gap-2">
              <span className={`inline-block text-xs arabic-text px-3 py-1 rounded-full border font-medium ${badgeStyle || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {value}
              </span>
              {copyable && value !== 'غير محدد' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-6 w-6 p-0 hover:bg-gray-100 flex-shrink-0"
                  title="نسخ"
                >
                  📋
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {shouldTruncateInCompact ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-w-full">
                  <p className="arabic-text text-xs text-gray-600 mb-1">المحتوى طويل - يظهر في قسم منفصل أسفل</p>
                  <p className="arabic-text text-sm font-medium break-words line-clamp-2">
                    {value.substring(0, 100)}...
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <p className={`arabic-text font-medium flex-1 ${
                    multiline ? 'whitespace-pre-wrap leading-relaxed' : ''
                  } ${className || ''} ${
                    isLongText ? 'text-sm' : ''
                  } break-words word-wrap max-w-full`}>
                    {value}
                  </p>
                  {copyable && value !== 'غير محدد' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-6 w-6 p-0 hover:bg-gray-100 flex-shrink-0 mt-0.5"
                      title="نسخ"
                    >
                      📋
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
