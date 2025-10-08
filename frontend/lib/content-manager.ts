// أداة إدارة المحتوى الديناميكي - بصمة تصميم

import { servicesData, blogPostsData, ServiceData, BlogPostData } from './seo-config'

/**
 * إضافة خدمة جديدة للنظام
 * @param service بيانات الخدمة الجديدة
 */
export function addNewService(service: ServiceData): boolean {
  try {
    // التحقق من عدم وجود معرف مكرر
    if (servicesData.some(s => s.id === service.id)) {
      console.error(`❌ Service ID "${service.id}" already exists`)
      return false
    }

    // التحقق من صحة البيانات الأساسية
    if (!service.title || !service.description || !service.category) {
      console.error('❌ Missing required fields: title, description, category')
      return false
    }

    // إضافة الخدمة
    servicesData.push(service)
    
    console.log(`✅ Service "${service.title}" added successfully!`)
    console.log(`📄 URL: /services/${service.id}`)
    console.log(`🔍 SEO: Auto-configured`)
    
    return true
  } catch (error) {
    console.error('❌ Error adding service:', error)
    return false
  }
}

/**
 * إضافة مقال جديد للنظام
 * @param post بيانات المقال الجديد
 */
export function addNewBlogPost(post: BlogPostData): boolean {
  try {
    // التحقق من عدم وجود slug مكرر
    if (blogPostsData.some(p => p.slug === post.slug)) {
      console.error(`❌ Blog slug "${post.slug}" already exists`)
      return false
    }

    // التحقق من صحة البيانات الأساسية
    if (!post.title || !post.description || !post.slug) {
      console.error('❌ Missing required fields: title, description, slug')
      return false
    }

    // التحقق من صيغة التاريخ
    if (!isValidDate(post.publishDate)) {
      console.error('❌ Invalid date format. Use YYYY-MM-DD')
      return false
    }

    // إضافة المقال
    blogPostsData.push(post)
    
    console.log(`✅ Blog post "${post.title}" added successfully!`)
    console.log(`📄 URL: /blog/${post.slug}`)
    console.log(`🔍 SEO: Auto-configured`)
    
    return true
  } catch (error) {
    console.error('❌ Error adding blog post:', error)
    return false
  }
}

/**
 * الحصول على جميع الخدمات
 */
export function getAllServices(): ServiceData[] {
  return servicesData
}

/**
 * الحصول على جميع المقالات
 */
export function getAllBlogPosts(): BlogPostData[] {
  return blogPostsData.sort((a, b) => 
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  )
}

/**
 * البحث عن خدمة بالمعرف
 */
export function findServiceById(id: string): ServiceData | null {
  return servicesData.find(s => s.id === id) || null
}

/**
 * البحث عن مقال بالـ slug
 */
export function findBlogPostBySlug(slug: string): BlogPostData | null {
  return blogPostsData.find(p => p.slug === slug) || null
}

/**
 * الحصول على خدمات حسب الفئة
 */
export function getServicesByCategory(category: string): ServiceData[] {
  return servicesData.filter(s => 
    s.category.toLowerCase().includes(category.toLowerCase())
  )
}

/**
 * الحصول على مقالات حسب الفئة
 */
export function getBlogPostsByCategory(category: string): BlogPostData[] {
  return blogPostsData.filter(p => 
    p.category.toLowerCase().includes(category.toLowerCase())
  )
}

/**
 * الحصول على مقالات حسب التاج
 */
export function getBlogPostsByTag(tag: string): BlogPostData[] {
  return blogPostsData.filter(p => 
    p.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  )
}

/**
 * إنشاء خدمة نموذجية للاختبار
 */
export function createSampleService(id: string, title: string): ServiceData {
  return {
    id,
    title,
    description: `خدمة ${title} احترافية مقدمة من بصمة تصميم. نحن نقدم حلول إبداعية ومتميزة تلبي احتياجاتك وتحقق أهدافك بأعلى معايير الجودة والاحترافية.`,
    shortDescription: `خدمة ${title} احترافية من بصمة تصميم`,
    keywords: [
      title.toLowerCase(),
      "بصمة تصميم", 
      "خدمة احترافية",
      "تصميم إبداعي",
      "جودة عالية"
    ],
    category: "خدمات عامة",
    price: "حسب المشروع",
    features: [
      "جودة احترافية عالية",
      "تسليم في الموعد المحدد", 
      "دعم فني متواصل",
      "ضمان الجودة"
    ]
  }
}

/**
 * إنشاء مقال نموذجي للاختبار
 */
export function createSampleBlogPost(slug: string, title: string): BlogPostData {
  const today = new Date().toISOString().split('T')[0]
  
  return {
    slug,
    title,
    description: `${title} - مقال شامل ومفيد من فريق بصمة تصميم. تعرف على أحدث الاتجاهات والنصائح العملية في عالم التصميم والإبداع.`,
    keywords: [
      title.toLowerCase(),
      "بصمة تصميم",
      "تصميم",
      "نصائح",
      "إرشادات"
    ],
    category: "تصميم",
    author: "فريق بصمة تصميم",
    publishDate: today,
    readTime: 5,
    tags: ["تصميم", "نصائح", "إبداع"]
  }
}

/**
 * عرض إحصائيات المحتوى
 */
export function getContentStats() {
  const stats = {
    services: {
      total: servicesData.length,
      categories: [...new Set(servicesData.map(s => s.category))].length,
      mostPopularCategory: getMostPopularCategory(servicesData.map(s => s.category))
    },
    blog: {
      total: blogPostsData.length,
      categories: [...new Set(blogPostsData.map(p => p.category))].length,
      tags: [...new Set(blogPostsData.flatMap(p => p.tags))].length,
      authors: [...new Set(blogPostsData.map(p => p.author))].length
    },
    seo: {
      totalPages: servicesData.length + blogPostsData.length + 10, // + static pages
      sitemapEntries: servicesData.length + blogPostsData.length + 20, // + additional
      structuredDataPages: servicesData.length + blogPostsData.length + 1 // + home
    }
  }

  console.group('📊 Content Statistics')
  console.log('🛠️ Services:', stats.services)
  console.log('📝 Blog:', stats.blog)
  console.log('🔍 SEO:', stats.seo)
  console.groupEnd()

  return stats
}

/**
 * التحقق من صحة تاريخ
 */
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false
  
  const date = new Date(dateString)
  const timestamp = date.getTime()
  
  if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
    return false
  }
  
  return dateString === date.toISOString().split('T')[0]
}

/**
 * إيجاد الفئة الأكثر شيوعاً
 */
function getMostPopularCategory(categories: string[]): string {
  const counts = categories.reduce((acc, category) => {
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'غير محدد'
}

/**
 * البحث في المحتوى
 */
export function searchContent(query: string): {
  services: ServiceData[]
  posts: BlogPostData[]
} {
  const lowerQuery = query.toLowerCase()
  
  const services = servicesData.filter(service => 
    service.title.toLowerCase().includes(lowerQuery) ||
    service.description.toLowerCase().includes(lowerQuery) ||
    service.keywords.some(k => k.toLowerCase().includes(lowerQuery))
  )

  const posts = blogPostsData.filter(post => 
    post.title.toLowerCase().includes(lowerQuery) ||
    post.description.toLowerCase().includes(lowerQuery) ||
    post.keywords.some(k => k.toLowerCase().includes(lowerQuery)) ||
    post.tags.some(t => t.toLowerCase().includes(lowerQuery))
  )

  return { services, posts }
}

/**
 * تصدير البيانات لـ sitemap
 */
export function exportForSitemap(): Array<{
  url: string
  lastModified: Date
  changeFrequency: 'daily' | 'weekly' | 'monthly'
  priority: number
  type: 'service' | 'blog'
}> {
  const baseUrl = 'https://basmatdesign.cloud'
  
  const serviceEntries = servicesData.map(service => ({
    url: `${baseUrl}/services/${service.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
    type: 'service' as const
  }))

  const blogEntries = blogPostsData.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishDate),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
    type: 'blog' as const
  }))

  return [...serviceEntries, ...blogEntries]
}

// تصدير الدوال والبيانات
export {
  servicesData,
  blogPostsData
}
