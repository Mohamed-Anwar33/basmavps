"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { apiFetch } from "@/lib/api"
import { useToastContext } from "@/contexts/toast-context"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function ActivateAccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToastContext()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('رابط التفعيل غير صحيح')
      return
    }

    activateAccount(token)
  }, [searchParams])

  const activateAccount = async (token: string) => {
    try {
      const response = await apiFetch<{ success: boolean; message: string }>(`/auth/activate?token=${token}`)
      
      if (response.success) {
        setStatus('success')
        setMessage('تم تفعيل حسابك بنجاح!')
        toast({ 
          title: "تم تفعيل الحساب", 
          description: "يمكنك الآن تسجيل الدخول", 
          variant: "success" 
        })
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(response.message || 'فشل في تفعيل الحساب')
      }
    } catch (error: any) {
      setStatus('error')
      const errorMessage = error?.error || error?.message || 'حدث خطأ أثناء تفعيل الحساب';
      setMessage(errorMessage)
      toast({ 
        title: "فشل تفعيل الحساب", 
        description: errorMessage, 
        variant: "destructive" 
      })
    }
  }

  const goToLogin = () => {
    router.push('/login')
  }

  const goToSignup = () => {
    router.push('/signup')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          <Card className="border-border/50">
            <CardContent className="p-8 text-center space-y-6">
              {status === 'loading' && (
                <>
                  <div className="flex justify-center">
                    <Loader2 className="h-16 w-16 text-primary animate-spin" />
                  </div>
                  <h1 className="text-2xl font-bold arabic-text">جاري تفعيل حسابك...</h1>
                  <p className="text-muted-foreground arabic-text">يرجى الانتظار</p>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="flex justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-green-600 arabic-text">تم تفعيل حسابك بنجاح!</h1>
                  <p className="text-muted-foreground arabic-text">{message}</p>
                  <p className="text-sm text-muted-foreground arabic-text">
                    سيتم توجيهك لصفحة تسجيل الدخول خلال 3 ثوانٍ...
                  </p>
                  <Button onClick={goToLogin} className="arabic-text">
                    الذهاب لتسجيل الدخول الآن
                  </Button>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="flex justify-center">
                    <XCircle className="h-16 w-16 text-red-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-red-600 arabic-text">فشل في تفعيل الحساب</h1>
                  <p className="text-muted-foreground arabic-text">{message}</p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={goToLogin} variant="outline" className="arabic-text">
                      تسجيل الدخول
                    </Button>
                    <Button onClick={goToSignup} className="arabic-text">
                      إنشاء حساب جديد
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
