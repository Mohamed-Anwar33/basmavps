import Link from 'next/link'
import { ExternalLink, ArrowRight } from 'lucide-react'

interface InternalLink {
  title: string
  description: string
  href: string
  category: 'service' | 'page' | 'blog'
  icon?: React.ReactNode
  isExternal?: boolean
}

interface InternalLinksProps {
  title?: string
  links: InternalLink[]
  maxLinks?: number
  showDescription?: boolean
  className?: string
}

export function InternalLinks({ 
  title = "روابط ذات صلة", 
  links, 
  maxLinks = 6,
  showDescription = true,
  className = ""
}: InternalLinksProps) {
  const displayLinks = links.slice(0, maxLinks)

  return (
    <section className={`bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 ${className}`}>
      <h3 className="text-xl font-bold text-[#4B2E83] mb-4 flex items-center">
        <ArrowRight className="ml-2 h-5 w-5" />
        {title}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayLinks.map((link, index) => (
          <Link
            key={link.href}
            href={link.href}
            className="group bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-purple-100 hover:border-purple-200"
            {...(link.isExternal && { 
              target: "_blank", 
              rel: "noopener noreferrer" 
            })}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  {link.icon && (
                    <span className="ml-2 text-[#4B2E83]">
                      {link.icon}
                    </span>
                  )}
                  <h4 className="font-semibold text-[#4B2E83] group-hover:text-[#6b46c1] transition-colors">
                    {link.title}
                  </h4>
                  {link.isExternal && (
                    <ExternalLink className="mr-1 h-3 w-3 text-gray-400" />
                  )}
                </div>
                {showDescription && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {link.description}
                  </p>
                )}
                <span className="inline-block mt-2 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                  {getCategoryLabel(link.category)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Structured Data for Internal Links */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": title,
            "itemListElement": displayLinks.map((link, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "url": link.isExternal ? link.href : `https://basmatdesign.cloud${link.href}`,
              "name": link.title,
              "description": link.description
            }))
          })
        }}
      />
    </section>
  )
}

function getCategoryLabel(category: string): string {
  const labels = {
    service: 'خدمة',
    page: 'صفحة',
    blog: 'مقال'
  }
  return labels[category as keyof typeof labels] || 'رابط'
}

// Predefined internal link collections
export const internalLinksCollections = {
  homePageLinks: [
    {
      title: "خدماتنا",
      description: "تعرف على جميع خدمات بصمة تصميم من تصميم الشعارات إلى السوشيال ميديا",
      href: "/services",
      category: "page" as const
    },
    {
      title: "أعمالنا",
      description: "استعرض معرض أعمالنا ومشاريعنا السابقة مع عملائنا",
      href: "/portfolio", 
      category: "page" as const
    },
    {
      title: "من نحن",
      description: "تعرف على قصة بصمة تصميم وفريق العمل المبدع",
      href: "/about",
      category: "page" as const
    },
    {
      title: "تواصل معنا",
      description: "احصل على استشارة مجانية وتواصل مع فريقنا",
      href: "/contact",
      category: "page" as const
    },
    {
      title: "اطلب خدمة",
      description: "اطلب خدمتك المطلوبة بسهولة من خلال نموذج الطلب",
      href: "/order",
      category: "page" as const
    },
    {
      title: "الأسئلة الشائعة",
      description: "أجوبة على الأسئلة الأكثر شيوعاً حول خدماتنا",
      href: "/faq",
      category: "page" as const
    }
  ],

  servicesPageLinks: [
    {
      title: "تصميم الشعارات",
      description: "تصميم شعارات احترافية وفريدة تعكس هوية علامتك التجارية",
      href: "/services/logo-design",
      category: "service" as const
    },
    {
      title: "الهوية البصرية",
      description: "تطوير هوية بصرية متكاملة لعلامتك التجارية",
      href: "/services/branding",
      category: "service" as const
    },
    {
      title: "السوشيال ميديا",
      description: "إدارة وتصميم محتوى منصات التواصل الاجتماعي",
      href: "/services/social-media",
      category: "service" as const
    },
    {
      title: "البنرات الإعلانية",
      description: "تصميم بنرات إعلانية احترافية للحملات التسويقية",
      href: "/services/advertising-banners",
      category: "service" as const
    },
    {
      title: "كتابة المحتوى",
      description: "خدمات كتابة المحتوى الإبداعي والتسويقي",
      href: "/services/content-writing",
      category: "service" as const
    },
    {
      title: "تصميم السير الذاتية",
      description: "تصميم سير ذاتية احترافية ومميزة",
      href: "/services/cv-design",
      category: "service" as const
    }
  ],

  blogLinks: [
    {
      title: "أهمية الهوية البصرية للشركات",
      description: "تعرف على أهمية الهوية البصرية وتأثيرها على نجاح علامتك التجارية",
      href: "/blog/branding-importance",
      category: "blog" as const
    },
    {
      title: "نصائح لتصميم شعار احترافي",
      description: "نصائح وإرشادات من خبراء التصميم لإنشاء شعار مميز وفعال",
      href: "/blog/logo-design-tips",
      category: "blog" as const
    },
    {
      title: "استراتيجية السوشيال ميديا الفعالة",
      description: "كيف تبني استراتيجية ناجحة لمنصات التواصل الاجتماعي",
      href: "/blog/social-media-strategy",
      category: "blog" as const
    },
    {
      title: "علم نفس الألوان في التصميم",
      description: "تأثير الألوان على المشاعر وكيفية استخدامها في التصميم",
      href: "/blog/color-psychology",
      category: "blog" as const
    },
    {
      title: "اتجاهات التصميم لعام 2024",
      description: "أحدث اتجاهات التصميم الجرافيكي والهوية البصرية",
      href: "/blog/design-trends-2024",
      category: "blog" as const
    },
    {
      title: "بناء الهوية التجارية القوية",
      description: "خطوات عملية لبناء هوية تجارية قوية ومؤثرة",
      href: "/blog/business-identity",
      category: "blog" as const
    }
  ]
}
