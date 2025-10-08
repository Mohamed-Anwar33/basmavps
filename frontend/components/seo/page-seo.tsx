'use client'

import { useEffect } from 'react'

interface PageSEOProps {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'service'
  breadcrumbs?: Array<{
    name: string
    url: string
  }>
  services?: Array<{
    name: string
    description: string
    category?: string
  }>
}

export function PageSEO({
  title,
  description,
  keywords = [],
  image = '/og-image.jpg',
  url = 'https://basmatdesign.cloud',
  type = 'website',
  breadcrumbs = [],
  services = []
}: PageSEOProps) {
  useEffect(() => {
    // Update page title dynamically
    document.title = `${title} | بصمة تصميم`
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    }
    
    // Update keywords
    if (keywords.length > 0) {
      const metaKeywords = document.querySelector('meta[name="keywords"]')
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords.join(', '))
      }
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDescription = document.querySelector('meta[property="og:description"]')
    const ogImage = document.querySelector('meta[property="og:image"]')
    const ogUrl = document.querySelector('meta[property="og:url"]')
    
    if (ogTitle) ogTitle.setAttribute('content', title)
    if (ogDescription) ogDescription.setAttribute('content', description)
    if (ogImage) ogImage.setAttribute('content', image)
    if (ogUrl) ogUrl.setAttribute('content', url)
    
    // Update Twitter Cards
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    const twitterDescription = document.querySelector('meta[name="twitter:description"]')
    const twitterImage = document.querySelector('meta[name="twitter:image"]')
    
    if (twitterTitle) twitterTitle.setAttribute('content', title)
    if (twitterDescription) twitterDescription.setAttribute('content', description)
    if (twitterImage) twitterImage.setAttribute('content', image)
    
  }, [title, description, keywords, image, url])

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": url,
    "image": image,
    "publisher": {
      "@type": "Organization",
      "name": "بصمة تصميم",
      "logo": {
        "@type": "ImageObject",
        "url": "https://basmatdesign.cloud/LOGO.png"
      }
    },
    ...(breadcrumbs.length > 0 && {
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": crumb.url
        }))
      }
    }),
    ...(services.length > 0 && {
      "offers": services.map(service => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service.name,
          "description": service.description,
          ...(service.category && { "category": service.category })
        },
        "seller": {
          "@type": "Organization",
          "name": "بصمة تصميم"
        }
      }))
    })
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  )
}

// SEO configurations for common pages
export const seoConfigs = {
  home: {
    title: "بصمة تصميم - شركة التصميم والهوية البصرية الأولى",
    description: "بصمة تصميم الشركة الرائدة في تصميم الهوية البصرية وإدارة السوشيال ميديا. نصمم شعارات احترافية ومحتوى إبداعي يميز علامتك التجارية ويحقق أهدافك التسويقية بأعلى معايير الجودة.",
    keywords: [
      "بصمة تصميم", "شركة تصميم", "تصميم شعارات", "هوية بصرية",
      "تصميم جرافيك", "سوشيال ميديا", "محتوى إبداعي", "تصميم احترافي",
      "Basmat Design", "علامة تجارية", "بنرات إعلانية", "كتابة محتوى"
    ],
    url: "https://basmatdesign.cloud"
  },
  
  about: {
    title: "من نحن - قصة بصمة تصميم وفريق العمل",
    description: "تعرف على بصمة تصميم وفريق العمل المبدع. نحن شركة متخصصة في التصميم الجرافيكي والهوية البصرية مع خبرة تزيد عن 5 سنوات في السوق.",
    keywords: [
      "بصمة تصميم", "من نحن", "فريق العمل", "شركة تصميم", 
      "خبرة تصميم", "قصة النجاح", "رؤية الشركة", "مهمة الشركة"
    ],
    url: "https://basmatdesign.cloud/about"
  },
  
  services: {
    title: "خدمات بصمة تصميم - تصميم شعارات وهوية بصرية",
    description: "خدمات بصمة تصميم الشاملة: تصميم الشعارات، الهوية البصرية، السوشيال ميديا، البنرات الإعلانية، كتابة المحتوى، وتصميم السير الذاتية. جودة احترافية وأسعار تنافسية.",
    keywords: [
      "خدمات تصميم", "تصميم شعارات", "هوية بصرية", "سوشيال ميديا",
      "بنرات إعلانية", "كتابة محتوى", "سير ذاتية", "تصميم احترافي",
      "أسعار تصميم", "باقات تصميم"
    ],
    url: "https://basmatdesign.cloud/services"
  },
  
  contact: {
    title: "تواصل مع بصمة تصميم - احصل على استشارة مجانية",
    description: "تواصل مع فريق بصمة تصميم للحصول على استشارة مجانية حول مشروعك. نحن هنا لمساعدتك في تحقيق رؤيتك الإبداعية بأفضل الحلول التصميمية.",
    keywords: [
      "تواصل معنا", "استشارة مجانية", "خدمة العملاء", "طلب خدمة",
      "رقم الهاتف", "البريد الإلكتروني", "عنوان الشركة", "موقع الشركة"
    ],
    url: "https://basmatdesign.cloud/contact"
  },
  
  portfolio: {
    title: "أعمال بصمة تصميم - معرض الأعمال والمشاريع",
    description: "استعرض معرض أعمال بصمة تصميم ومشاريعنا السابقة في تصميم الشعارات والهوية البصرية. أعمال إبداعية متنوعة لعملائنا في مختلف القطاعات.",
    keywords: [
      "معرض الأعمال", "مشاريع سابقة", "شعارات مصممة", "هوية بصرية",
      "أعمال إبداعية", "تصاميم احترافية", "عينات أعمال", "portfolio"
    ],
    url: "https://basmatdesign.cloud/portfolio"
  }
}
