import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { FoundationalStatement } from "@/components/foundational-statement"
import { LuxuryBanner } from "@/components/luxury-banner"
import { SettingsBanner } from "@/components/settings-banner"
import { DynamicBanners } from "@/components/dynamic-banners"
import { WhatMakesUsDifferent } from "@/components/what-makes-us-different"
import { ServicesPreview } from "@/components/services-preview"
import { CountersSection } from "@/components/counters-section"
import Banner from "@/components/banner"
import CurvedBannerSection from "@/components/curved-banner-section"

export const metadata = {
  title: "بصمة تصميم | خدمات التصميم والمحتوى الرقمي الاحترافية",
  description: "بصمة تصميم - شركة رائدة متخصصة في تصميم الهوية البصرية، السوشيال ميديا، والمحتوى الرقمي. نقدم خدمات تصميم احترافية عالية الجودة مع فريق من الخبراء المبدعين.",
  keywords: ["بصمة تصميم", "تصميم جرافيك", "هوية بصرية", "سوشيال ميديا", "تصميم شعارات", "محتوى رقمي", "تصميم احترافي", "شركة تصميم", "خدمات تصميم", "تصميم إبداعي", "Basmat Design", "تصميم عربي"],
  openGraph: {
    title: "بصمة تصميم | خدمات التصميم والمحتوى الرقمي الاحترافية",
    description: "بصمة تصميم - شركة رائدة متخصصة في تصميم الهوية البصرية، السوشيال ميديا، والمحتوى الرقمي. نقدم خدمات تصميم احترافية عالية الجودة مع فريق من الخبراء المبدعين.",
    type: "website",
    url: "https://basmatdesign.cloud",
    images: [{
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "بصمة تصميم - خدمات التصميم والمحتوى الرقمي"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "بصمة تصميم | خدمات التصميم والمحتوى الرقمي الاحترافية",
    description: "بصمة تصميم - شركة رائدة متخصصة في تصميم الهوية البصرية، السوشيال ميديا، والمحتوى الرقمي الاحترافي.",
    images: ["/og-image.jpg"]
  },
  alternates: {
    canonical: "https://basmatdesign.cloud"
  }
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "بصمة تصميم - خدمات التصميم والمحتوى الرقمي",
            "description": "شركة بصمة تصميم - متخصصون في تصميم الهوية البصرية، السوشيال ميديا، والمحتوى الرقمي. خدمات تصميم احترافية في السعودية مع فريق خبراء.",
            "url": "https://basmatdesign.com",
            "mainEntity": {
              "@type": "Organization",
              "name": "بصمة تصميم",
              "url": "https://basmatdesign.com",
              "logo": "https://basmatdesign.com/logo.png",
              "description": "شركة بصمة تصميم - متخصصون في تصميم الهوية البصرية، السوشيال ميديا، والمحتوى الرقمي",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "SA",
                "addressRegion": "الرياض"
              },
              "offers": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "تصميم الهوية البصرية",
                    "description": "خدمات تصميم الشعارات والهوية البصرية الاحترافية"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "إدارة السوشيال ميديا",
                    "description": "إدارة وتصميم محتوى منصات التواصل الاجتماعي"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "تصميم البنرات الإعلانية",
                    "description": "تصميم بنرات إعلانية احترافية للحملات التسويقية"
                  }
                }
              ]
            }
          })
        }}
      />
      <Header />
      <main className="relative z-20">
        <HeroSection />
        <FoundationalStatement />
        <CurvedBannerSection 
          position="top" 
          pageSlug="home" 
          curveDepth={80}
          topSectionColor="rgb(248, 250, 252)"
          bottomSectionColor="rgb(255, 255, 255)"
        />
        <WhatMakesUsDifferent />
        <ServicesPreview />
        <CountersSection />
        <CurvedBannerSection 
          position="bottom" 
          pageSlug="home" 
          curveDepth={60}
          topSectionColor="rgb(255, 255, 255)"
          bottomSectionColor="rgb(248, 250, 252)"
        />
      </main>
      <Footer />
    </div>
  )
}
