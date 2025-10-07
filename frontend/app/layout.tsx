import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import Providers from "@/components/providers"
// import { CanonicalUrl } from "@/components/seo/canonical-url"
import { ErrorBoundary } from "@/components/error-boundary"

export const metadata: Metadata = {
  title: {
    default: "بصمة تصميم | خدمات التصميم والمحتوى الرقمي الاحترافية",
    template: "%s | بصمة تصميم"
  },
  description: "بصمة تصميم - شركة رائدة متخصصة في تصميم الهوية البصرية، السوشيال ميديا، والمحتوى الرقمي. نقدم خدمات تصميم احترافية عالية الجودة مع فريق من الخبراء المبدعين.",
  keywords: ["بصمة تصميم", "تصميم جرافيك", "هوية بصرية", "سوشيال ميديا", "تصميم شعارات", "محتوى رقمي", "تصميم احترافي", "شركة تصميم", "خدمات تصميم", "تصميم إبداعي", "Basmat Design", "تصميم عربي"],
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
    title: 'بصمة تصميم | خدمات التصميم والمحتوى الرقمي الاحترافية',
    description: 'بصمة تصميم - شركة رائدة متخصصة في تصميم الهوية البصرية، السوشيال ميديا، والمحتوى الرقمي. نقدم خدمات تصميم احترافية عالية الجودة مع فريق من الخبراء المبدعين.',
    siteName: 'بصمة تصميم',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'بصمة تصميم - خدمات التصميم والمحتوى الرقمي',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'بصمة تصميم | خدمات التصميم والمحتوى الرقمي الاحترافية',
    description: 'بصمة تصميم - شركة رائدة متخصصة في تصميم الهوية البصرية، السوشيال ميديا، والمحتوى الرقمي الاحترافي.',
    images: ['/og-image.jpg'],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["Organization", "CreativeWork"],
              "name": "بصمة تصميم",
              "alternateName": ["Basmat Design", "بصمة تصميم السعودية", "Basmat Design Saudi Arabia"],
              "url": "https://basmatdesign.cloud",
              "logo": "https://basmatdesign.cloud/LOGO.png",
              "description": "بصمة تصميم - شركة رائدة متخصصة في تصميم الهوية البصرية، السوشيال ميديا، والمحتوى الرقمي الاحترافي. نقدم خدمات تصميم إبداعية عالية الجودة",
              "foundingDate": "2020",
              "slogan": "نصمم، نكتب، ونبني لك هوية تترك أثرًا",
              "keywords": ["بصمة تصميم", "تصميم جرافيك", "هوية بصرية", "سوشيال ميديا", "تصميم شعارات", "محتوى رقمي", "تصميم احترافي", "شركة تصميم", "Basmat Design"],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "SA",
                "addressRegion": "الرياض"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": ["Arabic", "English"]
              },
              "sameAs": [
                "https://twitter.com/basmatdesign",
                "https://instagram.com/basmatdesign",
                "https://linkedin.com/company/basmatdesign"
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
              "areaServed": {
                "@type": "Country",
                "name": "Saudi Arabia"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "خدمات بصمة تصميم",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "بصمة تصميم - خدمات التصميم الشاملة"
                    }
                  }
                ]
              }
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
          <Analytics />
        </ErrorBoundary>
      </body>
    </html>
  )
}
