"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { MessageCircle, Mail, Clock, AlertCircle, CheckCircle2, ArrowUpRight, ArrowLeft, Instagram, Linkedin } from "lucide-react"
import { apiFetch } from "@/lib/api"

const ContactContent = () => {
  const [cfg, setCfg] = useState<Record<string, any> | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch('/contact-page', { method: 'GET' }) as any
        if (res?.success && res.data) {
          const d = res.data
          // If API already returns flat structure, use it directly
          if (d.headerTitle || d.headerSubtitle || d.whatsappLink) {
            setCfg({
              headerTitle: d.headerTitle || 'معلومات التواصل – بصمة تصميم',
              headerSubtitle: d.headerSubtitle || 'نحن نؤمن أن التواصل الواضح هو أساس الخدمة الاحترافية. جميع طلبات الخدمات والتفاصيل تُدار حصريًا عبر القنوات التالية:',
              whatsappLink: (d.whatsappLink ?? '').toString().trim(),
              email: d.email || 'contact@basmadesign.com',
              workingHoursText: d.workingHoursText || 'يوميًا من الساعة 10 صباحًا حتى 10 مساءً – بتوقيت السعودية',
              notes: Array.isArray(d.notes) ? d.notes : [],
              socialInstagram: (d.socialInstagram ?? '').toString().trim(),
              socialTwitter: (d.socialTwitter ?? '').toString().trim(),
              socialLinkedin: (d.socialLinkedin ?? '').toString().trim(),
              socialTiktok: (d.socialTiktok ?? '').toString().trim()
            })
          } else {
            // Transform nested multilingual data to flat structure
            const transformedData = {
              headerTitle: d.heroTitle?.ar || 'معلومات التواصل – بصمة تصميم',
              headerSubtitle: d.heroSubtitle?.ar || 'نحن نؤمن أن التواصل الواضح هو أساس الخدمة الاحترافية. جميع طلبات الخدمات والتفاصيل تُدار حصريًا عبر القنوات التالية:',
              whatsappLink: (d.contactInfo?.whatsappLink ?? '').toString().trim(),
              email: d.contactInfo?.email || 'contact@basmadesign.com',
              workingHoursText: d.contactInfo?.workingHours?.ar || 'يوميًا من الساعة 10 صباحًا حتى 10 مساءً – بتوقيت السعودية',
              notes: d.importantNotesSection?.notes?.map((note: any) => note?.ar).filter(Boolean) || [],
              socialInstagram: (d.socialMediaSection?.platforms?.instagram ?? '').toString().trim(),
              socialTwitter: (d.socialMediaSection?.platforms?.twitter ?? '').toString().trim(),
              socialLinkedin: (d.socialMediaSection?.platforms?.linkedin ?? '').toString().trim(),
              socialTiktok: (d.socialMediaSection?.platforms?.tiktok ?? '').toString().trim()
            }
            setCfg(transformedData)
          }
        } else {
          // Fallback to default values if API fails
          setCfg({
            headerTitle: 'معلومات التواصل – بصمة تصميم',
            headerSubtitle: 'نحن نؤمن أن التواصل الواضح هو أساس الخدمة الاحترافية. جميع طلبات الخدمات والتفاصيل تُدار حصريًا عبر القنوات التالية:',
            whatsappLink: '',
            email: 'contact@basmadesign.com',
            workingHoursText: 'يوميًا من الساعة 10 صباحًا حتى 10 مساءً – بتوقيت السعودية',
            notes: [
              'لا يتم الرد على الطلبات غير المدفوعة أو غير المكتملة',
              'لا يُعتمد أي تواصل عبر منصات أخرى (مثل إنستغرام أو تويتر) لتنفيذ الطلبات',
              'جميع المحادثات تُدار باحترام متبادل، وأي تجاوز يُعد مخالفة تعاقدية'
            ],
            socialInstagram: '',
            socialTwitter: '',
            socialLinkedin: '',
            socialTiktok: ''
          })
        }
      } catch (error) {
        setCfg(null)
      }
    }
    load()
  }, [])

  const headerTitle = cfg?.headerTitle || 'معلومات التواصل – بصمة تصميم'
  const headerSubtitle = cfg?.headerSubtitle || 'نحن نؤمن أن التواصل الواضح هو أساس الخدمة الاحترافية. جميع طلبات الخدمات والتفاصيل تُدار حصريًا عبر القنوات التالية:'
  const whatsappLink = (cfg?.whatsappLink ?? '').toString().trim()
  const email = cfg?.email || 'contact@basmadesign.com'
  const workingHoursText = cfg?.workingHoursText || 'يوميًا من الساعة 10 صباحًا حتى 10 مساءً – بتوقيت السعودية'
  const notes: string[] = Array.isArray(cfg?.notes) ? cfg!.notes : [
    'لا يتم الرد على الطلبات غير المدفوعة أو غير المكتملة',
    'لا يُعتمد أي تواصل عبر منصات أخرى (مثل إنستغرام أو تويتر) لتنفيذ الطلبات',
    'جميع المحادثات تُدار باحترام متبادل، وأي تجاوز يُعد مخالفة تعاقدية',
  ]
  const socialInstagram = (cfg?.socialInstagram ?? '').toString().trim()
  const socialTwitter = (cfg?.socialTwitter ?? '').toString().trim()
  const socialLinkedin = (cfg?.socialLinkedin ?? '').toString().trim()
  const socialTiktok = (cfg?.socialTiktok ?? '').toString().trim()

  const isValidLink = (url: string) => !!url && url !== '#'
  const isValidWhats = (url: string) => isValidLink(url) && !/wa\.me\/your-number/i.test(url)

  return (
    <div className="min-h-screen py-20 pt-32">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 arabic-text">
            {headerTitle}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed arabic-text">
            {headerSubtitle}
          </p>
        </div>

        {/* Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* WhatsApp */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 text-green-700">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <CardTitle className="arabic-text">القناة الرسمية للتواصل — واتساب</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="arabic-text">
                يُستخدم حصريًا لتأكيد الطلبات، توضيح التفاصيل، واستلام الملفات. يتم فتح قناة التواصل بعد إتمام الدفع مباشرة.
              </CardDescription>

              <Alert className="border-green-200/60">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="arabic-text">ملاحظة</AlertTitle>
                <AlertDescription className="arabic-text">
                  يُلزم العميل عند التواصل بتقديم رقم الطلب أو البريد الإلكتروني المستخدم في الدفع، لضمان التحقق وربط الطلب بالتنفيذ.
                </AlertDescription>
              </Alert>

              {isValidWhats(whatsappLink) && (
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 arabic-text [&>*]:!text-black [&>*>*]:!text-black">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2" style={{color: '#000 !important'}}>
                      <span style={{color: '#000 !important'}}>تواصل عبر واتساب</span>
                      <ArrowLeft className="h-4 w-4 rtl-flip" style={{color: '#000 !important'}} />
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <Mail className="h-5 w-5" />
                </div>
                <CardTitle className="arabic-text">البريد الإلكتروني</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="arabic-text">للاستفسارات العامة والاقتراحات:</CardDescription>
              <a href={`mailto:${email}`} className="text-primary hover:text-accent transition-colors arabic-text">
                {email}
              </a>
              <p className="text-xs text-muted-foreground arabic-text">نرد خلال ساعات العمل الموضحة أدناه.</p>
            </CardContent>
          </Card>
        </div>

        {/* Working Hours */}
        <Card className="mb-10 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
            <CardTitle className="arabic-text">ساعات العمل الرسمية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="arabic-text">
              {workingHoursText}
            </p>
            <p className="text-muted-foreground arabic-text">
              أي تواصل خارج هذه الساعات يُرد عليه في أقرب وقت ممكن خلال ساعات العمل.
            </p>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="mb-10 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 text-red-700">
              <AlertCircle className="h-5 w-5" />
            </div>
            <CardTitle className="arabic-text">ملاحظات مهمة</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {notes.map((n, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground arabic-text">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  {n}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Social Platforms */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="arabic-text">منصاتنا على مواقع التواصل</CardTitle>
            <CardDescription className="arabic-text">
              تابعنا واطّلع على جديد أعمالنا عبر المنصات التالية:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isValidLink(socialInstagram) && (
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Instagram className="h-5 w-5 text-pink-600" />
                    <span className="arabic-text">إنستغرام</span>
                  </div>
                  <a href={socialInstagram} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent flex items-center gap-1">
                    زيارة
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              )}
              {isValidLink(socialTwitter) && (
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {/* Using generic icon for X (Twitter) to avoid unsupported icon */}
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <span className="arabic-text">تويتر (X)</span>
                  </div>
                  <a href={socialTwitter} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent flex items-center gap-1">
                    زيارة
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              )}
              {isValidLink(socialLinkedin) && (
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-5 w-5 text-sky-700" />
                    <span className="arabic-text">لينكدإن</span>
                  </div>
                  <a href={socialLinkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent flex items-center gap-1">
                    زيارة
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              )}
              {isValidLink(socialTiktok) && (
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {/* No TikTok icon in lucide-react; using generic arrow */}
                    <ArrowUpRight className="h-5 w-5 text-black" />
                    <span className="arabic-text">تيك توك</span>
                  </div>
                  <a href={socialTiktok} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent flex items-center gap-1">
                    زيارة
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>

            <Alert className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="arabic-text">
                جميع حساباتنا الرسمية تُستخدم للعرض والرد على الاستفسارات فقط، ولا تُعتمد لتنفيذ الطلبات.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ContactContent
