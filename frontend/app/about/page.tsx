import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageBanner } from "@/components/page-banner"
import Link from "next/link"
import { Users, Target, Eye, Heart, Shield, Award, Clock, CheckCircle, ArrowLeft } from "lucide-react"
import { apiFetch } from "@/lib/api"
import Banner from "@/components/banner"
import CurvedBannerSection from "@/components/curved-banner-section"

export const metadata = {
  title: "من نحن | بصمة تصميم - فريق التصميم والإبداع الرقمي",
  description: "تعرف على فريق بصمة تصميم وقيمنا ورؤيتنا في عالم التصميم والإبداع. شركة سعودية متخصصة في الهوية البصرية والمحتوى الرقمي مع فريق من الخبراء المبدعين.",
  keywords: ["فريق بصمة تصميم", "شركة تصميم سعودية", "من نحن", "فريق إبداعي", "خبراء تصميم", "رؤية الشركة", "قيم التصميم"],
  alternates: {
    canonical: "https://basmatdesign.com/about",
  },
  openGraph: {
    title: "من نحن | بصمة تصميم - فريق التصميم والإبداع الرقمي",
    description: "تعرف على فريق بصمة تصميم وقيمنا ورؤيتنا في عالم التصميم والإبداع. شركة سعودية متخصصة في الهوية البصرية والمحتوى الرقمي مع فريق من الخبراء المبدعين.",
    type: "website",
    url: "https://basmatdesign.com/about",
    images: [{
      url: "/about-og-image.jpg",
      width: 1200,
      height: 630,
      alt: "فريق بصمة تصميم - من نحن"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "من نحن | بصمة تصميم - فريق التصميم والإبداع الرقمي",
    description: "تعرف على فريق بصمة تصميم وقيمنا ورؤيتنا في عالم التصميم والإبداع.",
    images: ["/about-og-image.jpg"]
  }
}

// Dynamic data will be loaded from API

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AboutPage() {
  // Load dynamic content from settings (category=about)
  let heroTitleSetting = ""
  let heroSubtitleSetting = ""
  let missionTitleSetting = ""
  let missionDescSetting = ""
  let whoBehindTitle = ""
  let whoBehindBody = ""
  let visionTitle = ""
  let visionBody = ""
  let valuesSetting: Array<{ title: string; description: string; icon?: string }> | null = null
  let teamSetting: Array<{ name: string; role: string; description: string }> | null = null
  let processSetting: Array<{ title: string; description: string; icon?: string }> | null = null
  let missionFeaturesSetting: Array<{ title: string; description: string; icon?: string; color?: string }> | null = null
  let whyUsTitle = ""
  let whyUsBody = ""
  let bannerQuote = ""
  let ctaPrimaryText = ""
  let ctaPrimaryLink = ""
  let ctaSecondaryText = ""
  let ctaSecondaryLink = ""
  try {
    const res = await apiFetch('/settings?category=about', { method: 'GET', cache: 'no-store' }) as any
    const m: Record<string, any> = {}
    const settingsArray = res?.data || res || []
    settingsArray.forEach((s: any) => { m[s.key] = s.value })
    heroTitleSetting = m.heroTitle || ""
    heroSubtitleSetting = m.heroSubtitle || ""
    missionTitleSetting = m.missionTitle || ""
    missionDescSetting = m.missionDesc || ""
    whoBehindTitle = m.whoBehindTitle || ""
    whoBehindBody = m.whoBehindBody || ""
    visionTitle = m.visionTitle || ""
    visionBody = m.visionBody || ""
    valuesSetting = Array.isArray(m.values) ? m.values : null
    teamSetting = Array.isArray(m.team) ? m.team : null
    processSetting = Array.isArray(m.process) ? m.process : null
    missionFeaturesSetting = Array.isArray(m.missionFeatures) ? m.missionFeatures : null
    whyUsTitle = m.whyUsTitle || ""
    whyUsBody = m.whyUsBody || ""
    // WhyUs data loaded
    bannerQuote = m.bannerQuote || ""
    ctaPrimaryText = m.ctaPrimaryText || ""
    ctaPrimaryLink = m.ctaPrimaryLink || ""
    ctaSecondaryText = m.ctaSecondaryText || ""
    ctaSecondaryLink = m.ctaSecondaryLink || ""
  } catch {}
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
{/* PageBanner مخفي بناءً على طلب المستخدم */}
      
      {/* Hero Section */}
      <section className="py-20 pt-32 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 relative overflow-hidden z-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-primary/5 rounded-full blur-lg animate-pulse delay-500" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {heroTitleSetting ? (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-tight arabic-text bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
                {heroTitleSetting}
              </h1>
            ) : (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-tight arabic-text text-primary">
                نحن لا ننافس على الشكل, 
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">بل على الأثر</span>
              </h1>
            )}

            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto arabic-text">
              {heroSubtitleSetting || (
                <>في بصمة تصميم، نؤمن أن التصميم الحقيقي لا يقتصر على الجمال البصري، بل يمتد ليشمل القدرة على ترك أثر إيجابي ودائم في نفوس الجمهور.</>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3 arabic-text">
                {missionTitleSetting || "رسالتنا"}
              </h2>
              <div className="h-1 w-16 rounded-full bg-gradient-to-r from-primary to-accent mb-6" />
              <p className="text-lg text-muted-foreground leading-relaxed mb-6 arabic-text">
                {missionDescSetting || (
                  <>نسعى لأن نكون الشريك الإبداعي الموثوق لكل من يريد أن يترك بصمة مميزة في عالمه الرقمي. نحن نؤمن بقوة التصميم في تغيير الطريقة التي ينظر بها العالم لعلامتك التجارية.</>
                )}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed arabic-text">
                كل مشروع نعمل عليه هو فرصة لإبداع قصة بصرية فريدة تحكي عن قيمك وتطلعاتك، وتصل بها إلى قلوب وعقول جمهورك المستهدف.
              </p>
            </div>
            
            <div className="relative">
              {/* Floating Background Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-8 right-12 w-20 h-20 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-8 left-12 w-16 h-16 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }} />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary/10 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s', animationDuration: '6s' }} />
              </div>
              
              <div className="rounded-3xl p-10 border border-primary/20 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4B2E83 0%, #4B2E83CC 50%, #4B2E83 100%)' }}>
                {/* Decorative Pattern Overlay */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3Ccircle cx='15' cy='15' r='1'/%3E%3Ccircle cx='45' cy='15' r='1'/%3E%3Ccircle cx='15' cy='45' r='1'/%3E%3Ccircle cx='45' cy='45' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                  }} />
                </div>
                
                <div className="grid grid-cols-2 gap-8 relative z-10">
                  {(missionFeaturesSetting && Array.isArray(missionFeaturesSetting) && missionFeaturesSetting.length > 0 ? missionFeaturesSetting : [
                    { title: "الدقة", description: "في كل التفاصيل", icon: "Target", color: "bg-gradient-to-br from-primary to-primary/80" },
                    { title: "الشغف", description: "بما نقوم به", icon: "Heart", color: "bg-gradient-to-br from-accent to-accent/80" },
                    { title: "التعاون", description: "مع عملائنا", icon: "Users", color: "bg-gradient-to-br from-green-500 to-green-600" },
                    { title: "التميز", description: "في النتائج", icon: "Award", color: "bg-gradient-to-br from-yellow-500 to-yellow-600" }
                  ]).map((feature, index) => {
                    // Map icon names to components
                    const iconMap: any = { Target, Heart, Users, Award };
                    const Icon = iconMap[feature.icon as string] || Target;
                    const colorClass = feature.color || "bg-gradient-to-br from-primary to-primary/80";
                    
                    return (
                      <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                        <div className="relative mb-6">
                          <div className={`w-20 h-20 mx-auto ${colorClass} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 relative overflow-hidden border-2 border-white/30 group-hover:border-white/50`}>
                            {/* Icon glow effect */}
                            <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <Icon className="h-10 w-10 text-white relative z-10 drop-shadow-lg" />
                          </div>
                          {/* Floating ring animation */}
                          <div className="absolute inset-0 w-20 h-20 mx-auto border-2 border-white/40 rounded-2xl animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 arabic-text text-white drop-shadow-lg">
                          {feature.title}
                        </h3>
                        <p className="text-base text-white/90 arabic-text leading-relaxed font-medium">{feature.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Behind Section (dynamic) */}
      {(whoBehindTitle || whoBehindBody) && (
        <section className="py-20 relative z-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {whoBehindTitle && (
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 arabic-text">{whoBehindTitle}</h2>
              )}
              {whoBehindBody && (
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line arabic-text">{whoBehindBody}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-card via-background to-card relative overflow-hidden z-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-primary/5 rounded-full blur-lg animate-pulse delay-500" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3 arabic-text">
              من وراء الإبداع
            </h2>
            <div className="h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-primary to-accent mb-6" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto arabic-text">
              فريق من المبدعين والمتخصصين الذين يشاركونك شغف التميز والإبداع
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-max items-start">
            {(teamSetting && teamSetting.length > 0 ? teamSetting : [
              {
                name: "أحمد محمد",
                role: "مؤسس ومدير إبداعي",
                description: "خبرة أكثر من 8 سنوات في مجال التصميم الجرافيكي والهوية البصرية"
              },
              {
                name: "سارة أحمد", 
                role: "مصممة جرافيك",
                description: "متخصصة في تصميم السوشيال ميديا والمحتوى الرقمي الإبداعي"
              },
              {
                name: "محمد علي",
                role: "كاتب محتوى",
                description: "خبير في كتابة المحتوى التسويقي والإبداعي باللغة العربية"
              }
            ]).map((member, index) => (
              <Card key={index} className="bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-2xl overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="h-1 w-12 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary to-accent" />
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg ring-4 ring-primary/10">
                    <span className="text-2xl font-extrabold text-primary-foreground">{member.name.charAt(0)}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-primary mb-2 arabic-text">
                    {member.name}
                  </h3>
                  
                  <p className="text-accent font-semibold mb-4 arabic-text">{member.role}</p>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed arabic-text">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section - Timeline Design */}
      <section className="py-20 relative z-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 arabic-text">
              عمليتنا الإبداعية
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto arabic-text">
              منهجية مدروسة نتبعها مع كل مشروع لضمان الحصول على أفضل النتائج
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Clean Horizontal Timeline */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-accent/40 to-primary/20 hidden lg:block"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {(processSetting && processSetting.length > 0 ? processSetting : [
                  {
                    icon: "CheckCircle",
                    title: "الاستماع",
                    description: "نستمع لأحلامك وأهدافك لنفهم رؤيتك بشكل عميق"
                  },
                  {
                    icon: "Target",
                    title: "التصميم",
                    description: "نحول أفكارك إلى تصاميم مبدعة تعكس هويتك الفريدة"
                  },
                  {
                    icon: "Eye",
                    title: "المراجعة",
                    description: "نعرض عليك النتائج ونتلقى ملاحظاتك للوصول للكمال"
                  },
                  {
                    icon: "Award",
                    title: "التسليم",
                    description: "نسلمك عملك النهائي بأعلى جودة وفي الوقت المحدد"
                  }
                ]).map((step, index) => {
                  // Map icon names to actual icon components
                  const iconMap: any = {
                    CheckCircle,
                    Target,
                    Eye,
                    Award,
                    Heart,
                    Shield,
                    Clock
                  };
                  const Icon = iconMap[step.icon as string] || CheckCircle;
                  
                  return (
                    <div key={index} className="text-center group">
                      {/* Icon Circle */}
                      <div className="relative mb-8">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 relative z-10">
                          <Icon className="h-8 w-8 text-primary-foreground" />
                        </div>
                        
                        {/* Step Number Badge */}
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center shadow-md z-20 ring-1 ring-primary/20">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-primary arabic-text group-hover:text-accent transition-colors duration-300">
                          {step.title}
                        </h3>
                        
                        <p className="text-muted-foreground leading-relaxed arabic-text text-sm">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CurvedBannerSection 
        position="bottom" 
        pageSlug="about" 
        curveDepth={60}
        topSectionColor="rgb(255, 255, 255)"
        bottomSectionColor="rgb(248, 250, 252)"
      />

      {/* Vision Section (dynamic) */}
      <section className="py-20 bg-gradient-to-br from-accent/10 to-primary/10 relative overflow-hidden z-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-primary/5 rounded-full blur-lg animate-pulse delay-500" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8 arabic-text">
              {visionTitle || 'رؤيتنا للمستقبل'}
            </h2>
            
            {visionBody ? (
              <div className="text-lg text-muted-foreground leading-relaxed arabic-text whitespace-pre-line">{visionBody}</div>
            ) : (
              <>
                <p className="text-xl text-muted-foreground leading-relaxed mb-8 arabic-text">
                  نطمح لأن نكون الاسم الأول الذي يتبادر للذهن عندما يفكر أحدهم في التصميم والإبداع في المنطقة العربية. 
                  نريد أن نساهم في رفع مستوى التصميم العربي ونجعله منافساً عالمياً.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed arabic-text">
                  نحلم بعالم يقدر فيه التصميم الجيد، ويفهم تأثيره الحقيقي على نجاح الأعمال والمشاريع. 
                  عالم نساهم فيه بجعل كل علامة تجارية لها بصمة مميزة وأثر إيجابي.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      
      {/* Values Section (dynamic if provided) */}
      <section className="py-20 relative z-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 arabic-text">
              قيمنا الأساسية
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto arabic-text">
              المبادئ التي توجه كل قرار نتخذه وكل عمل نقوم به
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 auto-rows-max items-stretch">
            {(valuesSetting && valuesSetting.length > 0 ? valuesSetting : [
              {
                icon: "Heart",
                title: "الأصالة",
                description: "نؤمن بأن كل مشروع فريد ويستحق تصميماً يعكس شخصيته الخاصة"
              },
              {
                icon: "Shield",
                title: "الشفافية", 
                description: "سياساتنا واضحة، أسعارنا محددة، والتزامنا صادق مع كل عميل"
              },
              {
                icon: "Award",
                title: "التميّز",
                description: "نسعى للوصول لأعلى معايير الجودة في كل تفصيلة من عملنا"
              },
              {
                icon: "Clock",
                title: "الالتزام",
                description: "نحترم وقتك ونلتزم بالمواعيد المتفق عليها دون تأخير"
              }
            ]).map((value, index) => {
              // Map icon names to actual icon components
              const iconMap: any = {
                CheckCircle,
                Target,
                Eye,
                Award,
                Heart,
                Shield,
                Clock
              };
              const Icon = iconMap[value.icon as string] || Heart
              return (
                <Card
                  key={index}
                  className="h-full bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-center group overflow-hidden relative"
                >
                  <CardContent className="p-7 flex flex-col h-full">
                    {/* Decorative top bar */}
                    <div className="h-1 w-12 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary to-accent group-hover:from-accent group-hover:to-primary transition-colors"></div>

                    {/* Icon with ring */}
                    <div className="mx-auto mb-6 relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/12 to-accent/12 border border-primary/20 shadow-sm flex items-center justify-center">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary/0 to-accent/0 opacity-0 group-hover:opacity-20 blur-lg transition-opacity"></div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-primary mb-3 arabic-text group-hover:text-accent transition-colors">
                      {value.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed arabic-text text-sm">
                      {value.description}
                    </p>

                    <div className="mt-auto pt-6">
                      <div className="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Us Section (dynamic) */}
      {(whyUsTitle || whyUsBody) && (
        <section className="py-20 relative z-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {whyUsTitle && (
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 arabic-text">{whyUsTitle}</h2>
              )}
              {whyUsBody && (
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line arabic-text">{whyUsBody}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Optional Banner Quote Section */}
      {bannerQuote && (
        <section className="py-16 relative z-20">
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 text-center">
              <CardContent className="p-10">
                <p className="text-2xl md:text-3xl font-semibold arabic-text text-primary whitespace-pre-line">{bannerQuote}</p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden z-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-primary/5 rounded-full blur-lg animate-pulse delay-500" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8 arabic-text">
              هل أنت مستعد لترك بصمتك؟
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed arabic-text">
              انضم إلى مئات العملاء الذين وثقوا بنا لتحويل أحلامهم إلى حقيقة بصرية مذهلة
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-primary-foreground font-semibold text-lg px-8 py-4 arabic-text group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-primary/25 h-auto">
                <Link href={(ctaPrimaryLink || '/contact')} className="flex items-center gap-2">
                  <span>{ctaPrimaryText || 'تواصل معنا'}</span>
                  <ArrowLeft className="h-5 w-5 rtl-flip group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="font-semibold text-lg px-8 py-4 arabic-text border-primary/30 text-primary hover:bg-primary/10 hover:border-primary group bg-card/80 backdrop-blur-sm transition-all duration-300 hover:scale-105 h-auto">
                <Link href={(ctaSecondaryLink || '/services')}>{ctaSecondaryText || 'تعرف على خدماتنا'}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
