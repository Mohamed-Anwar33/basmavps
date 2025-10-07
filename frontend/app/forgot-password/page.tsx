"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/api"
import { Eye, EyeOff } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [devCode, setDevCode] = useState<string | null>(null)
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email')
  const [attempts, setAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const onSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setDevCode(null)
    if (!email) { setMessage("يرجى إدخال البريد الإلكتروني"); return }
    setLoading(true)
    try {
      const res = await apiFetch<{ success: boolean; message?: string; devCode?: string }>("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      setMessage(res?.message || "تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني")
      if ((res as any)?.devCode) setDevCode((res as any).devCode)
      setAttempts(0) // إعادة تعيين المحاولات عند طلب رمز جديد
      setIsBlocked(false)
      setStep('code')
    } catch (error: any) {
      if (error?.status === 429) {
        setMessage("تم تجاوز عدد المحاولات المسموح. يرجى المحاولة بعد 15 دقيقة")
      } else {
        setMessage("حدث خطأ. حاول مرة أخرى")
      }
    } finally {
      setLoading(false)
    }
  }

  const onSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!resetCode || resetCode.length !== 6) { 
      setMessage("يرجى إدخال الرمز المكون من 6 أرقام"); 
      return 
    }
    setLoading(true)
    try {
      // التحقق من صحة الرمز مع الخادم
      await apiFetch("/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: resetCode })
      })
      setStep('password')
    } catch (error: any) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      
      if (newAttempts >= 3) {
        setIsBlocked(true)
        setMessage("تم حظرك بعد 3 محاولات خاطئة. اطلب رمز جديد")
        setTimeout(() => {
          setIsBlocked(false)
          setAttempts(0)
          setStep('email')
        }, 60000) // حظر لمدة دقيقة
      } else {
        setMessage(`الرمز غير صحيح. المحاولات المتبقية: ${3 - newAttempts}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const onSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!newPassword || newPassword.length < 6) {
      setMessage("كلمة المرور يجب ألا تقل عن 6 أحرف")
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage("كلمتا المرور غير متطابقتين")
      return
    }
    setLoading(true)
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetCode, password: newPassword })
      })
      setMessage("تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول")
      setTimeout(() => router.push('/login'), 2000)
    } catch (error: any) {
      if (error?.status === 429) {
        setMessage("تم تجاوز عدد المحاولات. يرجى المحاولة بعد 15 دقيقة")
      } else {
        setMessage("حدث خطأ. تأكد من صحة الرمز")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-4">
              <h1 className="text-2xl font-bold arabic-text text-center">
                {step === 'email' && 'نسيت كلمة المرور'}
                {step === 'code' && 'إدخال رمز التأكيد'}
                {step === 'password' && 'كلمة المرور الجديدة'}
              </h1>
              <p className="text-sm text-muted-foreground arabic-text text-center">
                {step === 'email' && 'أدخل بريدك الإلكتروني لإرسال رمز إعادة تعيين كلمة المرور'}
                {step === 'code' && 'أدخل الرمز المكون من 6 أرقام الذي تم إرساله إلى بريدك'}
                {step === 'password' && 'أدخل كلمة المرور الجديدة'}
              </p>
              {message && (
                <div className="text-sm arabic-text bg-purple-50 border border-purple-200 p-2 rounded text-purple-800">{message}</div>
              )}
              {step === 'email' && (
                <form onSubmit={onSubmitEmail} className="grid gap-4">
                  <div>
                    <Label className="arabic-text">البريد الإلكتروني</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                  <Button type="submit" disabled={loading} className="arabic-text">
                    {loading ? "جاري الإرسال..." : "إرسال الرمز"}
                  </Button>
                </form>
              )}

              {step === 'code' && (
                <form onSubmit={onSubmitCode} className="grid gap-4">
                  <div>
                    <Label className="arabic-text">رمز التأكيد (6 أرقام)</Label>
                    <Input 
                      type="text" 
                      value={resetCode} 
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                      placeholder="123456"
                      className="text-center text-2xl font-bold tracking-widest"
                      maxLength={6}
                    />
                  </div>
                  <Button type="submit" disabled={loading || resetCode.length !== 6 || isBlocked} className="arabic-text">
                    {loading ? "جاري التحقق..." : isBlocked ? "محظور مؤقتاً" : "تأكيد الرمز"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setStep('email')} className="arabic-text">
                    عودة لإدخال البريد
                  </Button>
                </form>
              )}

              {step === 'password' && (
                <form onSubmit={onSubmitPassword} className="grid gap-4">
                  <div>
                    <Label className="arabic-text">كلمة المرور الجديدة</Label>
                    <div className="relative">
                      <Input 
                        type={showNewPassword ? "text" : "password"} 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        placeholder="كلمة المرور الجديدة"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="arabic-text">تأكيد كلمة المرور</Label>
                    <div className="relative">
                      <Input 
                        type={showConfirmPassword ? "text" : "password"} 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        placeholder="أعد كتابة كلمة المرور"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="arabic-text">
                    {loading ? "جاري الحفظ..." : "حفظ كلمة المرور"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setStep('code')} className="arabic-text">
                    عودة لإدخال الرمز
                  </Button>
                </form>
              )}
              {/* Development code display - hidden for production */}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
