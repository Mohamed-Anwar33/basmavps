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
    default: "بصمة تصميم | خدمات التصميم والمحتوى الرقمي في السعودية",
    template: "%s | بصمة تصميم"
  },
  description: "شركة بصمة تصميم - متخصصون في تصميم الهوية البصرية، السوشيال ميديا، والمحتوى الرقمي. خدمات تصميم احترافية في السعودية مع فريق خبراء.",
  keywords: ["تصميم جرافيك", "هوية بصرية", "سوشيال ميديا", "تصميم شعارات", "محتوى رقمي", "تصميم السعودية", "بصمة تصميم"],
  authors: [{ name: "بصمة تصميم", url: "https://basmatdesign.com" }],
  creator: "بصمة تصميم",
  publisher: "بصمة تصميم",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://basmatdesign.com'),
  alternates: {
    canonical: 'https://basmatdesign.com',
    languages: {
      'ar-SA': '/ar',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://basmatdesign.com',
    title: 'بصمة تصميم | خدمات التصميم والمحتوى الرقمي في السعودية',
    description: 'شركة بصمة تصميم - متخصصون في تصميم الهوية البصرية، السوشيال ميديا، والمحتوى الرقمي. خدمات تصميم احترافية في السعودية مع فريق خبراء.',
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
    title: 'بصمة تصميم | خدمات التصميم والمحتوى الرقمي في السعودية',
    description: 'شركة بصمة تصميم - متخصصون في تصميم الهوية البصرية، السوشيال ميديا، والمحتوى الرقمي.',
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
              "@type": "Organization",
              "name": "بصمة تصميم",
              "alternateName": "Basmat Design",
              "url": "https://basmatdesign.com",
              "logo": "https://basmatdesign.com/logo.png",
              "description": "شركة بصمة تصميم - متخصصون في تصميم الهوية البصرية، السوشيال ميديا، والمحتوى الرقمي",
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
                  "description": "خدمات تصميم الشعارات والهوية البصرية الاحترافية"
                },
                {
                  "@type": "Service",
                  "name": "إدارة السوشيال ميديا",
                  "description": "إدارة وتصميم محتوى منصات التواصل الاجتماعي"
                },
                {
                  "@type": "Service",
                  "name": "تصميم البنرات الإعلانية",
                  "description": "تصميم بنرات إعلانية احترافية للحملات التسويقية"
                }
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
          <Analytics />
        </ErrorBoundary>
      </body>
    </html>
  )
}
