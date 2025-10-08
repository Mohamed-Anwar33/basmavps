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
  title: "بصمة تصميم - شركة التصميم والهوية البصرية الأولى",
  description: "بصمة تصميم الشركة الرائدة في تصميم الهوية البصرية وإدارة السوشيال ميديا. نصمم شعارات احترافية ومحتوى إبداعي يميز علامتك التجارية ويحقق أهدافك التسويقية بأعلى معايير الجودة والإبداع.",
  keywords: [
    "بصمة تصميم", 
    "شركة تصميم",
    "تصميم شعارات", 
    "هوية بصرية",
    "تصميم جرافيك", 
    "سوشيال ميديا",
    "محتوى إبداعي",
    "تصميم احترافي",
    "Basmat Design",
    "علامة تجارية",
    "بنرات إعلانية",
    "كتابة محتوى",
    "تسويق رقمي",
    "استراتيجية بصرية",
    "تصميم عربي"
  ],
  openGraph: {
    title: "بصمة تصميم - شركة التصميم والهوية البصرية الأولى",
    description: "بصمة تصميم الشركة الرائدة في تصميم الهوية البصرية وإدارة السوشيال ميديا. تصميم شعارات احترافية ومحتوى إبداعي مميز.",
    type: "website",
    url: "https://basmatdesign.cloud",
    images: [{
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "بصمة تصميم - شركة التصميم والهوية البصرية الأولى"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "بصمة تصميم - شركة التصميم والهوية البصرية الأولى",
    description: "بصمة تصميم الشركة الرائدة في تصميم الهوية البصرية وإدارة السوشيال ميديا. تصميم شعارات احترافية ومحتوى إبداعي مميز.",
    images: ["/og-image.jpg"],
    creator: "@basmatdesign",
    site: "@basmatdesign"
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
            "@type": ["WebPage", "CollectionPage"],
            "name": "بصمة تصميم - شركة التصميم والهوية البصرية الأولى",
            "description": "بصمة تصميم الشركة الرائدة في تصميم الهوية البصرية وإدارة السوشيال ميديا. نصمم شعارات احترافية ومحتوى إبداعي يميز علامتك التجارية ويحقق أهدافك التسويقية.",
            "url": "https://basmatdesign.cloud",
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "الرئيسية",
                  "item": "https://basmatdesign.cloud"
                }
              ]
            },
            "mainEntity": {
              "@type": "Organization",
              "name": "بصمة تصميم",
              "legalName": "Basmat Design",
              "url": "https://basmatdesign.cloud",
              "logo": {
                "@type": "ImageObject",
                "url": "https://basmatdesign.cloud/LOGO.png",
                "width": "512",
                "height": "512"
              },
              "description": "بصمة تصميم الشركة الرائدة في تصميم الهوية البصرية وإدارة السوشيال ميديا",
              "slogan": "نصمم، نكتب، ونبني لك هوية تترك أثرًا",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "SA",
                "addressRegion": "الرياض"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "bestRating": "5",
                "ratingCount": "150"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog", 
                "name": "خدمات بصمة تصميم",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "تصميم الهوية البصرية والشعارات",
                      "description": "خدمات تصميم الشعارات والهوية البصرية الاحترافية",
                      "category": "Design Services"
                    },
                    "seller": {
                      "@type": "Organization",
                      "name": "بصمة تصميم"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "إدارة السوشيال ميديا",
                      "description": "إدارة وتصميم محتوى منصات التواصل الاجتماعي",
                      "category": "Social Media Marketing"
                    },
                    "seller": {
                      "@type": "Organization",
                      "name": "بصمة تصميم"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "تصميم البنرات الإعلانية",
                      "description": "تصميم بنرات إعلانية احترافية للحملات التسويقية",
                      "category": "Advertising Design"
                    },
                    "seller": {
                      "@type": "Organization",
                      "name": "بصمة تصميم"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "كتابة المحتوى الإبداعي",
                      "description": "خدمات كتابة المحتوى الإبداعي والتسويقي",
                      "category": "Content Writing"
                    },
                    "seller": {
                      "@type": "Organization",
                      "name": "بصمة تصميم"
                    }
                  }
                ]
              }
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
