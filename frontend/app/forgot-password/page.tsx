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

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [devToken, setDevToken] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setDevToken(null)
    if (!email) { setMessage("يرجى إدخال البريد الإلكتروني"); return }
    setLoading(true)
    try {
      const res = await apiFetch<{ success: boolean; message?: string; devToken?: string }>("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      setMessage(res?.message || "تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني")
      if ((res as any)?.devToken) setDevToken((res as any).devToken)
    } catch {
      setMessage("حدث خطأ. حاول مرة أخرى")
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
              <h1 className="text-2xl font-bold arabic-text text-center">نسيت كلمة المرور</h1>
              <p className="text-sm text-muted-foreground arabic-text text-center">أدخل بريدك الإلكتروني لإرسال رابط استعادة كلمة المرور</p>
              {message && (
                <div className="text-sm arabic-text bg-purple-50 border border-purple-200 p-2 rounded text-purple-800">{message}</div>
              )}
              <form onSubmit={onSubmit} className="grid gap-4">
                <div>
                  <Label className="arabic-text">البريد الإلكتروني</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <Button type="submit" disabled={loading} className="arabic-text">
                  {loading ? "جاري الإرسال..." : "إرسال الرابط"}
                </Button>
              </form>
              {devToken && (
                <div className="text-xs arabic-text text-muted-foreground">
                  رمز للاختبار (بيئة التطوير): <code className="bg-muted px-2 py-1 rounded">{devToken}</code>
                  <div className="mt-1">
                    <Button asChild size="sm" variant="outline" className="arabic-text">
                      <a href={`/reset-password?token=${devToken}`}>فتح صفحة إعادة التعيين</a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
