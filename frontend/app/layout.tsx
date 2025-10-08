import type React from "react"
import type { Metadata } from "next"
// import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import Providers from "@/components/providers"
// import { CanonicalUrl } from "@/components/seo/canonical-url"
import { ErrorBoundary } from "@/components/error-boundary"

export const metadata: Metadata = {
  title: {
    default: "بصمة تصميم - شركة التصميم والهوية البصرية الأولى",
    template: "%s | بصمة تصميم"
  },
  description: "بصمة تصميم الشركة الرائدة في تصميم الهوية البصرية وإدارة السوشيال ميديا. نصمم شعارات احترافية ومحتوى إبداعي يميز علامتك التجارية ويحقق أهدافك التسويقية بأعلى معايير الجودة.",
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
    "تصميم عربي",
    "خدمات تصميم",
    "بنرات إعلانية",
    "كتابة محتوى",
    "سير ذاتية",
    "تصميم إبداعي",
    "علامة تجارية",
    "تسويق رقمي",
    "استراتيجية بصرية"
  ],
  authors: [{ name: "بصمة تصميم", url: "https://basmatdesign.cloud" }],
  creator: "بصمة تصميم",
  publisher: "بصمة تصميم",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://basmatdesign.cloud'),
  alternates: {
    canonical: 'https://basmatdesign.cloud',
    languages: {
      'ar-SA': '/ar',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://basmatdesign.cloud',
    title: 'بصمة تصميم - شركة التصميم والهوية البصرية الأولى',
    description: 'بصمة تصميم الشركة الرائدة في تصميم الهوية البصرية وإدارة السوشيال ميديا. نصمم شعارات احترافية ومحتوى إبداعي يميز علامتك التجارية ويحقق أهدافك التسويقية بأعلى معايير الجودة.',
    siteName: 'بصمة تصميم',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'بصمة تصميم - شركة التصميم والهوية البصرية الأولى',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'بصمة تصميم - شركة التصميم والهوية البصرية الأولى',
    description: 'بصمة تصميم الشركة الرائدة في تصميم الهوية البصرية وإدارة السوشيال ميديا. تصميم شعارات احترافية ومحتوى إبداعي مميز.',
    images: ['/og-image.jpg'],
    creator: '@basmatdesign',
    site: '@basmatdesign',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  icons: {
    icon: [
      { url: '/LOGO.png', sizes: '32x32', type: 'image/png' },
      { url: '/LOGO.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/LOGO.png',
    apple: '/LOGO.png',
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/LOGO.png',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#4B2E83" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="بصمة تصميم" />
        <meta name="application-name" content="بصمة تصميم" />
        <meta name="msapplication-TileColor" content="#4B2E83" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="format-detection" content="telephone=no, address=no, email=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://basmatdesign.cloud" />
        <meta name="geo.region" content="SA-01" />
        <meta name="geo.placename" content="Riyadh, Saudi Arabia" />
        <meta name="geo.position" content="24.7136;46.6753" />
        <meta name="ICBM" content="24.7136, 46.6753" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["Organization", "LocalBusiness", "CreativeWork"],
              "name": "بصمة تصميم",
              "legalName": "Basmat Design",
              "alternateName": [
                "Basmat Design", 
                "بصمة تصميم السعودية", 
                "Basmat Design Saudi Arabia",
                "شركة بصمة تصميم",
                "مؤسسة بصمة تصميم"
              ],
              "url": "https://basmatdesign.cloud",
              "logo": {
                "@type": "ImageObject",
                "url": "https://basmatdesign.cloud/LOGO.png",
                "width": "512",
                "height": "512"
              },
              "image": "https://basmatdesign.cloud/og-image.jpg",
              "description": "بصمة تصميم الشركة الرائدة في تصميم الهوية البصرية وإدارة السوشيال ميديا. نصمم شعارات احترافية ومحتوى إبداعي يميز علامتك التجارية ويحقق أهدافك التسويقية بأعلى معايير الجودة.",
              "foundingDate": "2020",
              "slogan": "نصمم، نكتب، ونبني لك هوية تترك أثرًا",
              "keywords": [
                "بصمة تصميم", "شركة تصميم", "تصميم شعارات", "هوية بصرية", 
                "تصميم جرافيك", "سوشيال ميديا", "محتوى إبداعي", "تصميم احترافي", 
                "Basmat Design", "تصميم عربي", "بنرات إعلانية"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "SA",
                "addressRegion": "الرياض"
              },
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "availableLanguage": ["Arabic", "English"],
                  "url": "https://basmatdesign.cloud/contact"
                },
                {
                  "@type": "ContactPoint", 
                  "contactType": "sales",
                  "availableLanguage": ["Arabic", "English"],
                  "url": "https://basmatdesign.cloud/order"
                }
              ],
              "sameAs": [
                "https://twitter.com/basmatdesign",
                "https://instagram.com/basmatdesign",
                "https://linkedin.com/company/basmatdesign",
                "https://facebook.com/basmatdesign"
              ],
              "service": [
                {
                  "@type": "Service",
                  "name": "تصميم الهوية البصرية",
                  "description": "خدمات تصميم الشعارات والهوية البصرية الاحترافية",
                  "provider": {
                    "@type": "Organization",
                    "name": "بصمة تصميم"
                  }
                },
                {
                  "@type": "Service",
                  "name": "إدارة السوشيال ميديا",
                  "description": "إدارة وتصميم محتوى منصات التواصل الاجتماعي",
                  "provider": {
                    "@type": "Organization",
                    "name": "بصمة تصميم"
                  }
                },
                {
                  "@type": "Service",
                  "name": "تصميم البنرات الإعلانية",
                  "description": "تصميم بنرات إعلانية احترافية للحملات التسويقية",
                  "provider": {
                    "@type": "Organization",
                    "name": "بصمة تصميم"
                  }
                },
                {
                  "@type": "Service",
                  "name": "كتابة المحتوى",
                  "description": "خدمات كتابة المحتوى الإبداعي والتسويقي",
                  "provider": {
                    "@type": "Organization",
                    "name": "بصمة تصميم"
                  }
                },
                {
                  "@type": "Service",
                  "name": "تصميم السير الذاتية",
                  "description": "تصميم سير ذاتية احترافية ومميزة",
                  "provider": {
                    "@type": "Organization",
                    "name": "بصمة تصميم"
                  }
                }
              ],
              "areaServed": [
                {
                  "@type": "Country",
                  "name": "Saudi Arabia"
                },
                {
                  "@type": "Place",
                  "name": "Middle East"
                },
                {
                  "@type": "Place", 
                  "name": "Gulf Countries"
                }
              ],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "خدمات بصمة تصميم",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "تصميم الهوية البصرية والشعارات",
                      "description": "تصميم شعارات احترافية وهوية بصرية متكاملة"
                    },
                    "category": "Design Services"
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service", 
                      "name": "إدارة السوشيال ميديا",
                      "description": "إدارة وتصميم محتوى منصات التواصل الاجتماعي"
                    },
                    "category": "Social Media Marketing"
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "تصميم البنرات الإعلانية", 
                      "description": "تصميم بنرات إعلانية احترافية للحملات التسويقية"
                    },
                    "category": "Advertising Design"
                  }
                ]
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "bestRating": "5",
                "ratingCount": "150"
              },
              "numberOfEmployees": {
                "@type": "QuantitativeValue",
                "value": "10-50"
              },
              "knowsAbout": [
                "تصميم الشعارات",
                "الهوية البصرية", 
                "السوشيال ميديا",
                "التصميم الجرافيكي",
                "التسويق الرقمي",
                "المحتوى الإبداعي"
              ]
            })
          }}
          suppressHydrationWarning
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ErrorBoundary>
          <Providers>
            <Suspense fallback={null}>{children}</Suspense>
          </Providers>
          {/* <Analytics /> */}
        </ErrorBoundary>
      </body>
    </html>
  )
}
