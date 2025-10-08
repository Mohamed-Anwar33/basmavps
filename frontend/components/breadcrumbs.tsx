import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  name: string
  href: string
  current?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 rtl:space-x-reverse">
        <li className="inline-flex items-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-[#4B2E83] hover:text-[#6b46c1] transition-colors"
          >
            الرئيسية
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.href}>
            <div className="flex items-center">
              <ChevronRight className="flex-shrink-0 h-4 w-4 text-gray-400 mx-1" />
              {item.current ? (
                <span className="mr-1 text-sm font-medium text-gray-500 md:mr-2">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="mr-1 text-sm font-medium text-[#4B2E83] hover:text-[#6b46c1] transition-colors md:mr-2"
                >
                  {item.name}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
      
      {/* Structured Data for Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "الرئيسية",
                "item": "https://basmatdesign.cloud"
              },
              ...items.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 2,
                "name": item.name,
                "item": `https://basmatdesign.cloud${item.href}`
              }))
            ]
          })
        }}
      />
    </nav>
  )
}

// Predefined breadcrumb configurations for common pages
export const breadcrumbConfigs = {
  about: [
    { name: 'من نحن', href: '/about', current: true }
  ],
  services: [
    { name: 'خدماتنا', href: '/services', current: true }
  ],
  portfolio: [
    { name: 'أعمالنا', href: '/portfolio', current: true }
  ],
  contact: [
    { name: 'تواصل معنا', href: '/contact', current: true }
  ],
  order: [
    { name: 'اطلب خدمة', href: '/order', current: true }
  ],
  blog: [
    { name: 'المدونة', href: '/blog', current: true }
  ],
  faq: [
    { name: 'الأسئلة الشائعة', href: '/faq', current: true }
  ],
  'services-logo': [
    { name: 'خدماتنا', href: '/services' },
    { name: 'تصميم الشعارات', href: '/services/logo-design', current: true }
  ],
  'services-social': [
    { name: 'خدماتنا', href: '/services' },
    { name: 'السوشيال ميديا', href: '/services/social-media', current: true }
  ],
  'services-branding': [
    { name: 'خدماتنا', href: '/services' },
    { name: 'الهوية البصرية', href: '/services/branding', current: true }
  ]
}
