"use client"

import { useState } from "react"
import { RefreshCw, AlertCircle, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorMessageWithRefreshProps {
  title?: string
  message: string
  onRefresh?: () => Promise<void> | void
  showRefreshButton?: boolean
  variant?: 'error' | 'warning' | 'offline'
  className?: string
}

export function ErrorMessageWithRefresh({
  title = "خطأ في التحقق",
  message,
  onRefresh,
  showRefreshButton = true,
  variant = 'error',
  className = ""
}: ErrorMessageWithRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (!onRefresh) {
      // إذا لم يتم تمرير onRefresh، قم بتحديث الصفحة
      window.location.reload()
      return
    }

    setIsRefreshing(true)
    try {
      await onRefresh()
    } catch (error) {
    } finally {
      setIsRefreshing(false)
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'error':
        return {
          container: 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200',
          icon: 'text-red-500',
          title: 'text-red-800',
          message: 'text-red-700',
          button: 'bg-red-500 hover:bg-red-600'
        }
      case 'warning':
        return {
          container: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200',
          icon: 'text-amber-500',
          title: 'text-amber-800',
          message: 'text-amber-700',
          button: 'bg-amber-500 hover:bg-amber-600'
        }
      case 'offline':
        return {
          container: 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200',
          icon: 'text-gray-500',
          title: 'text-gray-800',
          message: 'text-gray-700',
          button: 'bg-gray-500 hover:bg-gray-600'
        }
      default:
        return {
          container: 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200',
          icon: 'text-red-500',
          title: 'text-red-800',
          message: 'text-red-700',
          button: 'bg-red-500 hover:bg-red-600'
        }
    }
  }

  const styles = getVariantStyles()

  const getIcon = () => {
    switch (variant) {
      case 'offline':
        return <WifiOff className="h-5 w-5" />
      case 'warning':
        return <AlertCircle className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  return (
    <div className={`relative overflow-hidden border rounded-lg p-4 shadow-sm ${styles.container} ${className}`}>
      {/* خلفية مزينة */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10 -mt-10 -mr-10">
        <div className="w-full h-full bg-current rounded-full"></div>
      </div>
      <div className="absolute bottom-0 left-0 w-16 h-16 opacity-5 -mb-8 -ml-8">
        <div className="w-full h-full bg-current rounded-full"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start gap-3">
          {/* أيقونة */}
          <div className={`flex-shrink-0 ${styles.icon} mt-1`}>
            {getIcon()}
          </div>

          {/* المحتوى */}
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold arabic-text mb-1 ${styles.title}`}>
              {title}
            </h4>
            <p className={`text-sm arabic-text leading-relaxed ${styles.message}`}>
              {message}
            </p>

            {/* زر التحديث */}
            {showRefreshButton && (
              <div className="mt-4 flex items-center gap-3">
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  size="sm"
                  className={`arabic-text text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${styles.button}`}
                >
                  <RefreshCw className={`h-4 w-4 ml-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'جاري التحديث...' : 'تحديث الصفحة'}
                </Button>

                {/* رسالة تحفيزية */}
                <p className="text-xs text-gray-500 arabic-text">
                  أو جرب مرة أخرى خلال دقائق قليلة
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// مكونات جاهزة للاستخدام المباشر
export function VerificationError({ 
  message = "رمز غير صحيح أو منتهي الصلاحية", 
  onRefresh 
}: { 
  message?: string
  onRefresh?: () => Promise<void> | void 
}) {
  return (
    <ErrorMessageWithRefresh
      title="خطأ في رمز التحقق"
      message={message}
      onRefresh={onRefresh}
      variant="error"
      className="mb-4"
    />
  )
}

export function NetworkError({ onRefresh }: { onRefresh?: () => Promise<void> | void }) {
  return (
    <ErrorMessageWithRefresh
      title="مشكلة في الاتصال"
      message="تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت."
      onRefresh={onRefresh}
      variant="offline"
      className="mb-4"
    />
  )
}

export function SessionExpired({ onRefresh }: { onRefresh?: () => Promise<void> | void }) {
  return (
    <ErrorMessageWithRefresh
      title="انتهت صلاحية الجلسة"
      message="انتهت صلاحية جلستك. يرجى تحديث الصفحة لبدء جلسة جديدة."
      onRefresh={onRefresh}
      variant="warning"
      className="mb-4"
    />
  )
}
