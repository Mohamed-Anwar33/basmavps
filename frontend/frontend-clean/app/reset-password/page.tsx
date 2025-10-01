"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/api"

export default function ResetPasswordPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const t = sp.get("token")
    setToken(t)
  }, [sp])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!token) { setMessage("رابط غير صالح"); return }
    if (!password || password.length < 6) { setMessage("كلمة المرور يجب ألا تقل عن 6 أحرف"); return }
    if (password !== confirm) { setMessage("كلمتا المرور غير متطابقتين"); return }
    setLoading(true)
    try {
      const res = await apiFetch<{ success: boolean; message?: string }>("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      })
      setMessage(res?.message || "تم تحديث كلمة المرور بنجاح")
      setTimeout(() => router.push("/login"), 1200)
    } catch {
      setMessage("فشل تحديث كلمة المرور. تأكد من صلاحية الرابط")
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
              <h1 className="text-2xl font-bold arabic-text text-center">إعادة تعيين كلمة المرور</h1>
              {message && (
                <div className="text-sm arabic-text bg-purple-50 border border-purple-200 p-2 rounded text-purple-800">{message}</div>
              )}
              <form onSubmit={onSubmit} className="grid gap-4">
                <div>
                  <Label className="arabic-text">كلمة المرور الجديدة</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <div>
                  <Label className="arabic-text">تأكيد كلمة المرور</Label>
                  <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
                </div>
                <Button type="submit" disabled={loading} className="arabic-text">
                  {loading ? "جاري الحفظ..." : "حفظ كلمة المرور"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
