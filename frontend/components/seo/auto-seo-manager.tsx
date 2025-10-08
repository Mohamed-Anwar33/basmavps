'use client'

import { useEffect } from 'react'
import { 
  generateServiceMetadata, 
  generateBlogMetadata,
  generateServiceStructuredData,
  generateBlogStructuredData,
  servicesData,
  blogPostsData
} from '@/lib/seo-config'

interface AutoSEOManagerProps {
  pageType: 'service' | 'blog' | 'home' | 'page'
  pageId?: string // service ID أو blog slug
  customData?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}

export function AutoSEOManager({ pageType, pageId, customData }: AutoSEOManagerProps) {
  useEffect(() => {
    // تحديث SEO تلقائياً حسب نوع الصفحة
    updatePageSEO()
  }, [pageType, pageId])

  const updatePageSEO = () => {
    let metadata = null
    let structuredData = null

    switch (pageType) {
      case 'service':
        if (pageId) {
          metadata = generateServiceMetadata(pageId)
          structuredData = generateServiceStructuredData(pageId)
        }
        break
      
      case 'blog':
        if (pageId) {
          metadata = generateBlogMetadata(pageId)
          structuredData = generateBlogStructuredData(pageId)
        }
        break
      
      case 'home':
        metadata = {
          title: "بصمة تصميم - شركة التصميم والهوية البصرية الأولى",
          description: "بصمة تصميم الشركة الرائدة في تصميم الهوية البصرية وإدارة السوشيال ميديا. نصمم شعارات احترافية ومحتوى إبداعي يميز علامتك التجارية."
        }
        break
      
      default:
        if (customData) {
          metadata = customData
        }
    }

    // تحديث العناصر في الصفحة
    if (metadata) {
      updateMetaTags(metadata)
    }

    if (structuredData) {
      injectStructuredData(structuredData)
    }
  }

  const updateMetaTags = (metadata: any) => {
    // تحديث title
    if (metadata.title) {
      document.title = metadata.title
    }

    // تحديث description
    if (metadata.description) {
      updateOrCreateMetaTag('name', 'description', metadata.description)
    }

    // تحديث keywords
    if (metadata.keywords) {
      const keywordsString = Array.isArray(metadata.keywords) 
        ? metadata.keywords.join(', ') 
        : metadata.keywords
      updateOrCreateMetaTag('name', 'keywords', keywordsString)
    }

    // تحديث Open Graph
    if (metadata.openGraph) {
      updateOrCreateMetaTag('property', 'og:title', metadata.openGraph.title)
      updateOrCreateMetaTag('property', 'og:description', metadata.openGraph.description)
      updateOrCreateMetaTag('property', 'og:type', metadata.openGraph.type)
      updateOrCreateMetaTag('property', 'og:url', metadata.openGraph.url)
      
      if (metadata.openGraph.images?.[0]) {
        updateOrCreateMetaTag('property', 'og:image', metadata.openGraph.images[0].url)
      }
    }

    // تحديث Twitter Cards
    if (metadata.twitter) {
      updateOrCreateMetaTag('name', 'twitter:card', metadata.twitter.card)
      updateOrCreateMetaTag('name', 'twitter:title', metadata.twitter.title)
      updateOrCreateMetaTag('name', 'twitter:description', metadata.twitter.description)
      
      if (metadata.twitter.images?.[0]) {
        updateOrCreateMetaTag('name', 'twitter:image', metadata.twitter.images[0])
      }
    }
  }

  const updateOrCreateMetaTag = (attribute: string, name: string, content: string) => {
    let metaTag = document.querySelector(`meta[${attribute}="${name}"]`)
    
    if (!metaTag) {
      metaTag = document.createElement('meta')
      metaTag.setAttribute(attribute, name)
      document.head.appendChild(metaTag)
    }
    
    metaTag.setAttribute('content', content)
  }

  const injectStructuredData = (data: any) => {
    // إزالة structured data الموجود للصفحة الحالية إن وجد
    const existingScript = document.querySelector('#auto-structured-data')
    if (existingScript) {
      existingScript.remove()
    }

    // إضافة structured data جديد
    const script = document.createElement('script')
    script.id = 'auto-structured-data'
    script.type = 'application/ld+json'
    script.innerHTML = JSON.stringify(data)
    document.head.appendChild(script)
  }

  // عرض إحصائيات SEO للمطورين (في وضع التطوير فقط)
  const showSEOStats = () => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 SEO Auto-Manager Stats')
      console.log(`📄 Page Type: ${pageType}`)
      console.log(`🆔 Page ID: ${pageId || 'N/A'}`)
      console.log(`📊 Services Available: ${servicesData.length}`)
      console.log(`📝 Blog Posts Available: ${blogPostsData.length}`)
      
      if (pageType === 'service' && pageId) {
        const service = servicesData.find(s => s.id === pageId)
        console.log(`🎯 Current Service: ${service?.title || 'Not Found'}`)
      }
      
      if (pageType === 'blog' && pageId) {
        const post = blogPostsData.find(p => p.slug === pageId)
        console.log(`📖 Current Post: ${post?.title || 'Not Found'}`)
      }
      
      console.groupEnd()
    }
  }

  useEffect(() => {
    showSEOStats()
  }, [pageType, pageId])

  return (
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
            ...(pageType === 'service' ? [{
              "@type": "ListItem",
              "position": 2,
              "name": "خدماتنا",
              "item": "https://basmatdesign.cloud/services"
            }] : []),
            ...(pageType === 'blog' ? [{
              "@type": "ListItem", 
              "position": 2,
              "name": "المدونة",
              "item": "https://basmatdesign.cloud/blog"
            }] : [])
          ]
        })
      }}
    />
  )
}

// Hook مساعد لاستخدام SEO Manager
export function useSEO(pageType: AutoSEOManagerProps['pageType'], pageId?: string) {
  useEffect(() => {
    // تحديث الـ canonical URL
    const updateCanonicalURL = () => {
      let canonicalUrl = 'https://basmatdesign.cloud'
      
      switch (pageType) {
        case 'service':
          canonicalUrl += `/services/${pageId}`
          break
        case 'blog':
          canonicalUrl += `/blog/${pageId}`
          break
        case 'home':
          // canonical URL already set
          break
        default:
          canonicalUrl += `/${pageType}`
      }

      let canonicalLink = document.querySelector('link[rel="canonical"]')
      if (!canonicalLink) {
        canonicalLink = document.createElement('link')
        canonicalLink.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalLink)
      }
      canonicalLink.setAttribute('href', canonicalUrl)
    }

    updateCanonicalURL()
  }, [pageType, pageId])

  return {
    availableServices: servicesData,
    availablePosts: blogPostsData,
    generateMetadata: pageType === 'service' ? generateServiceMetadata : generateBlogMetadata
  }
}
