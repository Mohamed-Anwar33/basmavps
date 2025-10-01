"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ErrorMessageWithRefresh, VerificationError } from "@/components/ui/error-message-with-refresh"
import { CheckCircle, Mail, Shield } from "lucide-react"

interface VerificationStepProps {
  email?: string
  onVerify: (code: string) => Promise<boolean>
  onResendCode?: () => Promise<void>
  isLoading?: boolean
  error?: string | null
}

export function VerificationStep({
  email,
  onVerify,
  onResendCode,
  isLoading = false,
  error = null
}: VerificationStepProps) {
  const [code, setCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const handleVerify = async () => {
    if (!code.trim() || code.length < 6) return
    
    setIsVerifying(true)
    try {
      const success = await onVerify(code)
      if (!success) {
        // الخطأ سيتم عرضه من parent component
      }
    } catch (err) {
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!onResendCode) return
    
    setIsResending(true)
    try {
      await onResendCode()
    } catch (err) {
    } finally {
      setIsResending(false)
    }
  }

  const handleRefresh = () => {
    // مسح البيانات وإعادة تحميل الصفحة
    setCode("")
    window.location.reload()
  }

  return (
    <Card className="max-w-md mx-auto shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-8">
        {/* Header فخم */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold arabic-text text-gray-800 mb-2">
            تحقق من بريدك الإلكتروني
          </h2>
          <p className="text-gray-600 arabic-text text-sm leading-relaxed">
            تم إرسال رمز التحقق إلى
            <br />
            <span className="font-semibold text-blue-600 dir-ltr inline-block mt-1">
              {email || 'بريدك الإلكتروني'}
            </span>
          </p>
        </div>

        {/* رسالة الخطأ الفخمة */}
        {error && (
          <VerificationError 
            message={error.includes('منتهي') || error.includes('expired') 
              ? "انتهت صلاحية رمز التحقق. يرجى تحديث الصفحة للحصول على رمز جديد."
              : error.includes('غير صحيح') || error.includes('invalid')
              ? "الرمز المدخل غير صحيح. تأكد من إدخال الرمز الصحيح أو قم بتحديث الصفحة."
              : error
            }
            onRefresh={handleRefresh}
          />
        )}

        {/* حقل إدخال الرمز */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 arabic-text mb-2">
              رمز التحقق (6 أرقام)
            </label>
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              className="text-center text-xl font-mono tracking-widest border-2 focus:border-blue-500 focus:ring-blue-500"
              disabled={isVerifying || isLoading}
              dir="ltr"
            />
            <p className="text-xs text-gray-500 arabic-text mt-1">
              أدخل الرمز المكون من 6 أرقام
            </p>
          </div>

          {/* أزرار الإجراءات */}
          <div className="space-y-3">
            <Button
              onClick={handleVerify}
              disabled={code.length < 6 || isVerifying || isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 font-semibold arabic-text shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {isVerifying ? (
                <>جاري التحقق...</>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 ml-2" />
                  تأكيد الرمز
                </>
              )}
            </Button>

            {/* إعادة الإرسال */}
            {onResendCode && (
              <Button
                onClick={handleResend}
                disabled={isResending || isLoading}
                variant="outline"
                className="w-full arabic-text border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                {isResending ? (
                  <>جاري الإرسال...</>
                ) : (
                  <>
                    <Mail className="h-4 w-4 ml-2" />
                    إعادة إرسال الرمز
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* نصائح مفيدة */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 arabic-text mb-2">
            💡 نصائح مفيدة:
          </h4>
          <ul className="text-xs text-blue-700 arabic-text space-y-1">
            <li>• تحقق من مجلد الرسائل المهملة (Spam)</li>
            <li>• تأكد من صحة عنوان البريد الإلكتروني</li>
            <li>• إذا لم تستلم الرمز، جرب تحديث الصفحة</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default VerificationStep
