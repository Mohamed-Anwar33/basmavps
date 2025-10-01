// SEO utility functions for better search engine optimization

export interface SEOData {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
}

export function generateMetadata(seoData: SEOData) {
  const {
    title,
    description,
    keywords = [],
    canonical,
    ogImage = '/og-image.jpg',
    ogType = 'website',
    publishedTime,
    modifiedTime,
    author,
    section,
    tags = []
  } = seoData

  return {
    title,
    description,
    keywords: [...keywords, 'بصمة تصميم', 'تصميم', 'محتوى رقمي'],
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title,
      description,
      type: ogType,
      url: canonical,
      images: [{
        url: ogImage,
        width: ogType === 'article' ? 800 : 1200,
        height: ogType === 'article' ? 400 : 630,
        alt: title
      }],
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
      section,
      tags,
      siteName: 'بصمة تصميم',
      locale: 'ar_SA'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage]
    },
    alternates: {
      canonical
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
    }
  }
}

export function generateStructuredData(type: 'Organization' | 'WebPage' | 'Article' | 'Service', data: any) {
  const baseContext = {
    '@context': 'https://schema.org'
  }

  switch (type) {
    case 'Organization':
      return {
        ...baseContext,
        '@type': 'Organization',
        name: 'بصمة تصميم',
        alternateName: 'Basmat Design',
        url: 'https://basmatdesign.com',
        logo: 'https://basmatdesign.com/logo.png',
        description: 'شركة بصمة تصميم - متخصصون في تصميم الهوية البصرية، السوشيال ميديا، والمحتوى الرقمي',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'SA',
          addressRegion: 'الرياض'
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: ['Arabic', 'English']
        },
        sameAs: [
          'https://twitter.com/basmatdesign',
          'https://instagram.com/basmatdesign',
          'https://linkedin.com/company/basmatdesign'
        ],
        ...data
      }

    case 'Article':
      return {
        ...baseContext,
        '@type': 'Article',
        headline: data.title,
        description: data.description,
        image: data.image,
        author: {
          '@type': 'Person',
          name: data.author
        },
        publisher: {
          '@type': 'Organization',
          name: 'بصمة تصميم',
          logo: {
            '@type': 'ImageObject',
            url: 'https://basmatdesign.com/logo.png'
          }
        },
        datePublished: data.publishedTime,
        dateModified: data.modifiedTime || data.publishedTime,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': data.url
        },
        articleSection: data.section,
        keywords: data.tags?.join(', '),
        inLanguage: 'ar-SA'
      }

    case 'WebPage':
      return {
        ...baseContext,
        '@type': 'WebPage',
        name: data.title,
        description: data.description,
        url: data.url,
        inLanguage: 'ar-SA',
        isPartOf: {
          '@type': 'WebSite',
          name: 'بصمة تصميم',
          url: 'https://basmatdesign.com'
        },
        ...data
      }

    case 'Service':
      return {
        ...baseContext,
        '@type': 'Service',
        name: data.name,
        description: data.description,
        provider: {
          '@type': 'Organization',
          name: 'بصمة تصميم',
          url: 'https://basmatdesign.com'
        },
        areaServed: {
          '@type': 'Country',
          name: 'Saudi Arabia'
        },
        ...data
      }

    default:
      return baseContext
  }
}

// Common SEO keywords for different page types
export const SEO_KEYWORDS = {
  design: ['تصميم جرافيك', 'تصميم إبداعي', 'تصميم احترافي', 'خدمات تصميم'],
  branding: ['هوية بصرية', 'تصميم شعارات', 'علامة تجارية', 'هوية تجارية'],
  social: ['سوشيال ميديا', 'إدارة حسابات', 'محتوى اجتماعي', 'تسويق اجتماعي'],
  digital: ['محتوى رقمي', 'تسويق رقمي', 'تصميم رقمي', 'حلول رقمية'],
  saudi: ['تصميم السعودية', 'شركة سعودية', 'خدمات الرياض', 'تصميم المملكة'],
  general: ['بصمة تصميم', 'خدمات إبداعية', 'تصميم متميز', 'فريق محترف']
}

export function getPageKeywords(pageType: keyof typeof SEO_KEYWORDS, additional: string[] = []) {
  return [
    ...SEO_KEYWORDS[pageType],
    ...SEO_KEYWORDS.general,
    ...additional
  ]
}
