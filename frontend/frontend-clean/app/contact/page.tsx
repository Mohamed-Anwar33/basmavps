import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageBanner } from "@/components/page-banner"
import ContactContent from "@/app/contact/contact-content"
import CurvedBannerSection from "@/components/curved-banner-section"
import type { Metadata } from 'next'

// Dynamic metadata generation
export async function generateMetadata(): Promise<Metadata> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'
    const response = await fetch(`${baseUrl}/contact-page`, {
      cache: 'no-store'
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data?.seoSettings) {
        const seo = data.data.seoSettings
        return {
          title: seo.pageTitle?.ar || 'معلومات التواصل – بصمة تصميم',
          description: seo.metaDescription?.ar || 'تواصل معنا عبر الواتساب أو البريد الإلكتروني للحصول على خدمات التصميم الاحترافية. نحن هنا لمساعدتك في تحقيق رؤيتك الإبداعية.',
          keywords: seo.keywords || 'تواصل، بصمة تصميم، واتساب، بريد إلكتروني، خدمات التصميم، دعم العملاء',
          openGraph: {
            title: seo.openGraphTitle?.ar || seo.pageTitle?.ar || 'معلومات التواصل – بصمة تصميم',
            description: seo.openGraphDescription?.ar || seo.metaDescription?.ar || 'تواصل معنا عبر الواتساب أو البريد الإلكتروني للحصول على خدمات التصميم الاحترافية. نحن هنا لمساعدتك في تحقيق رؤيتك الإبداعية.',
            type: 'website',
            locale: 'ar_SA',
            siteName: 'بصمة تصميم',
            images: seo.openGraphImage ? [seo.openGraphImage] : undefined,
          },
          twitter: {
            card: 'summary_large_image',
            title: seo.twitterTitle?.ar || seo.pageTitle?.ar || 'معلومات التواصل – بصمة تصميم',
            description: seo.twitterDescription?.ar || seo.metaDescription?.ar || 'تواصل معنا عبر الواتساب أو البريد الإلكتروني للحصول على خدمات التصميم الاحترافية. نحن هنا لمساعدتك في تحقيق رؤيتك الإبداعية.',
            images: seo.twitterImage ? [seo.twitterImage] : undefined,
          },
          alternates: {
            canonical: '/contact',
          },
        }
      }
    }
  } catch (error) {
  }

  // Fallback metadata
  return {
    title: 'معلومات التواصل – بصمة تصميم',
    description: 'تواصل معنا عبر الواتساب أو البريد الإلكتروني للحصول على خدمات التصميم الاحترافية. نحن هنا لمساعدتك في تحقيق رؤيتك الإبداعية.',
    keywords: 'تواصل، بصمة تصميم، واتساب، بريد إلكتروني، خدمات التصميم، دعم العملاء',
    openGraph: {
      title: 'معلومات التواصل – بصمة تصميم',
      description: 'تواصل معنا عبر الواتساب أو البريد الإلكتروني للحصول على خدمات التصميم الاحترافية. نحن هنا لمساعدتك في تحقيق رؤيتك الإبداعية.',
      type: 'website',
      locale: 'ar_SA',
      siteName: 'بصمة تصميم',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'معلومات التواصل – بصمة تصميم',
      description: 'تواصل معنا عبر الواتساب أو البريد الإلكتروني للحصول على خدمات التصميم الاحترافية. نحن هنا لمساعدتك في تحقيق رؤيتك الإبداعية.',
    },
    alternates: {
      canonical: '/contact',
    },
  }
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative z-20">
        <div className="container mx-auto px-4 py-16">
          <ContactContent />
        </div>
        <CurvedBannerSection 
          position="bottom" 
          pageSlug="contact" 
          curveDepth={60}
          topSectionColor="rgb(255, 255, 255)"
          bottomSectionColor="rgb(248, 250, 252)"
        />
      </main>
      <Footer />
    </div>
  )
}
