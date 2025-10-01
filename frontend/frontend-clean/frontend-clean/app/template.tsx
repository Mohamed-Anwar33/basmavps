'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function Template({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  useEffect(() => {
    // Only add canonical URL via metadata API, not DOM manipulation
    // This is handled by Next.js metadata API in layout.tsx
    
    // Optional: Update page title based on route
    if (typeof window !== 'undefined' && document) {
      const baseTitle = 'بصمة تصميم'
      let pageTitle = baseTitle
      
      switch (pathname) {
        case '/about':
          pageTitle = `من نحن | ${baseTitle}`
          break
        case '/services':
          pageTitle = `خدماتنا | ${baseTitle}`
          break
        case '/contact':
          pageTitle = `تواصل معنا | ${baseTitle}`
          break
        case '/blog':
          pageTitle = `المدونة | ${baseTitle}`
          break
        case '/order':
          pageTitle = `اطلب خدمة | ${baseTitle}`
          break
        case '/faq':
          pageTitle = `الأسئلة الشائعة | ${baseTitle}`
          break
        default:
          pageTitle = `${baseTitle} | خدمات التصميم والمحتوى الرقمي في السعودية`
      }
      
      if (document.title !== pageTitle) {
        document.title = pageTitle
      }
    }
  }, [pathname])

  return <>{children}</>
}
