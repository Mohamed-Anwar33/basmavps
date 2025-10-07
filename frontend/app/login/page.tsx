"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { apiFetch, setToken, setUser, setRefreshToken } from "@/lib/api"
import { useToastContext } from "@/contexts/toast-context"
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToastContext()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور")
      return
    }
    setLoading(true)
    try {
      const res = await apiFetch<{ data: { user: any; tokens: { accessToken: string; refreshToken: string } } }>("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      
      
      // Check if response has the expected structure
      const responseData = (res as any)?.data;
      if (!res || !responseData || !responseData.user || !responseData.tokens) {
        throw new Error("فشل تسجيل الدخول - استجابة غير صحيحة من الخادم")
      }
      
      setToken(responseData.tokens.accessToken)
      setRefreshToken(responseData.tokens.refreshToken)
      setUser(responseData.user)
      toast({ title: "مرحباً بك مجددًا", description: "تم تسجيل الدخول بنجاح", variant: "success" })
      router.push("/")
    } catch (err: any) {
      const errorMessage = err?.message || err?.error || "حدث خطأ أثناء تسجيل الدخول";
      setError(errorMessage)
      
      // Special handling for email verification error
      if (err?.requiresEmailVerification) {
        toast({ 
          title: "تفعيل الحساب مطلوب", 
          description: "يجب تفعيل حسابك أولاً. يرجى فحص بريدك الإلكتروني والضغط على رابط التفعيل.", 
          variant: "destructive"
        })
      } else {
        toast({ title: "فشل تسجيل الدخول", description: errorMessage, variant: "destructive" })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <style jsx>{`
        .force-black-text,
        .force-black-text *,
        .force-black-text span,
        .force-black-text a {
          color: #000 !important;
        }
      `}</style>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(139,92,246,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(236,72,153,0.1),transparent_50%)]"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Header />
      
      <main className="relative z-10 pt-28 pb-16 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          {/* Glassmorphism Card */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            
            <Card className="relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-8 space-y-6">
                {/* Header */}
                <div className="text-center space-y-4">
                  <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-6 shadow-lg">
                      <Image
                        src="/LOGO.png"
                        alt="بصمة تصميم"
                        width={64}
                        height={64}
                        className="w-16 h-16 object-contain filter brightness-0 invert"
                        priority
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-3xl font-bold text-white arabic-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient-shift">
                      أهلاً بعودتك إلى بصمة تصميم
                    </h1>
                    <p className="text-gray-300 arabic-text text-base leading-relaxed">
                      حيث الإبداع يلتقي بالتميز
                    </p>
                    <p className="text-gray-400 arabic-text text-sm">
                      سجل دخولك لاستكمال رحلتك الإبداعية معنا
                    </p>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm arabic-text p-4 rounded-xl backdrop-blur-sm">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={onSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label className="text-gray-200 arabic-text font-medium">البريد الإلكتروني</Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                      </div>
                      <Input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="you@example.com"
                        className="bg-white/5 border-white/10 text-white placeholder-gray-400 pr-10 h-12 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 hover:bg-white/10"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label className="text-gray-200 arabic-text font-medium">كلمة المرور</Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                      </div>
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="••••••••"
                        className="bg-white/5 border-white/10 text-white placeholder-gray-400 pr-10 pl-10 h-12 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 hover:bg-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-purple-400 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none arabic-text group [&>*]:!text-black [&>*>*]:!text-black"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span className="mr-2">جاري الدخول...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2" style={{color: '#000 !important'}}>
                        <span style={{color: '#000 !important'}}>تسجيل الدخول</span>
                        <ArrowRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" style={{color: '#000 !important'}} />
                      </div>
                    )}
                  </Button>
                </form>

                {/* Links */}
                <div className="space-y-4 text-center">
                  <Link 
                    href="/forgot-password" 
                    className="text-sm transition-colors arabic-text inline-block hover:underline force-black-text"
                    style={{color: '#000 !important', textDecoration: 'none'}}
                  >
                    <span style={{color: '#000 !important'}} className="force-black-text">نسيت كلمة المرور؟</span>
                  </Link>
                  
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
                    <span className="text-gray-400 text-sm arabic-text px-3">أو</span>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
                  </div>
                  
                  <p className="text-gray-300 text-sm arabic-text">
                    ليس لديك حساب؟{" "}
                    <Link 
                      href="/signup" 
                      className="font-semibold transition-colors hover:underline force-black-text"
                      style={{color: '#000 !important', textDecoration: 'none'}}
                    >
                      <span style={{color: '#000 !important'}} className="force-black-text">إنشاء حساب جديد</span>
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
