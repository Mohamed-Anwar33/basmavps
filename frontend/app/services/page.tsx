import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ServicesHero } from "@/components/services-hero"
import { ServicesGrid } from "@/components/services-grid"
import { PageBanner } from "@/components/page-banner"
import CurvedBannerSection from "@/components/curved-banner-section"

export const metadata = {
  title: "خدماتنا | بصمة تصميم - تصميم الهوية البصرية والسوشيال ميديا والمحتوى الرقمي",
  description: "اكتشف مجموعة خدماتنا الإبداعية في التصميم والمحتوى والهوية البصرية. خدمات تصميم الشعارات، إدارة السوشيال ميديا، تصميم البنرات الإعلانية، والمحتوى الرقمي الاحترافي في السعودية.",
  keywords: ["خدمات التصميم", "تصميم الهوية البصرية", "تصميم الشعارات", "إدارة السوشيال ميديا", "تصميم البنرات", "محتوى رقمي", "خدمات إبداعية", "تصميم احترافي"],
  openGraph: {
    title: "خدماتنا | بصمة تصميم - تصميم الهوية البصرية والسوشيال ميديا والمحتوى الرقمي",
    description: "اكتشف مجموعة خدماتنا الإبداعية في التصميم والمحتوى والهوية البصرية. خدمات تصميم الشعارات، إدارة السوشيال ميديا، تصميم البنرات الإعلانية، والمحتوى الرقمي الاحترافي في السعودية.",
    type: "website",
    url: "https://basmatdesign.com/services",
    images: [{
      url: "/services-og-image.jpg",
      width: 1200,
      height: 630,
      alt: "خدمات بصمة تصميم - التصميم والمحتوى الرقمي"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "خدماتنا | بصمة تصميم - تصميم الهوية البصرية والسوشيال ميديا والمحتوى الرقمي",
    description: "اكتشف مجموعة خدماتنا الإبداعية في التصميم والمحتوى والهوية البصرية.",
    images: ["/services-og-image.jpg"]
  },
  alternates: {
    canonical: "https://basmatdesign.com/services"
  }
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16 relative z-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 arabic-text">
            خدماتنا المتميزة
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto arabic-text leading-relaxed">
            نقدم مجموعة شاملة من الخدمات المتخصصة في التصميم والتطوير لمساعدتك في تحقيق أهدافك الرقمية
          </p>
        </div>
        
        <CurvedBannerSection 
          position="top" 
          pageSlug="services" 
          curveDepth={70}
          topSectionColor="rgb(248, 250, 252)"
          bottomSectionColor="rgb(255, 255, 255)"
        />
        <ServicesGrid />
        <CurvedBannerSection 
          position="bottom" 
          pageSlug="services" 
          curveDepth={60}
          topSectionColor="rgb(255, 255, 255)"
          bottomSectionColor="rgb(248, 250, 252)"
        />
      </main>
      <Footer />
    </div>
  )
}
