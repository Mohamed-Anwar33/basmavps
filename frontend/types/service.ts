export interface ServiceType {
  _id: string
  slug: string
  title: { ar: string; en: string }
  description: { ar: string; en: string }
  price: {
    SAR: number
    USD: number
  }
  originalPrice?: {
    SAR: number
    USD: number
  }
  deliveryTime: {
    min: number
    max: number
  }
  revisions: number
  category: string
  images: string[]
  mainImages?: Array<{
    url: string
    alt?: string
    order?: number
    uploadedAt?: string
    uploadedBy?: string
    _id?: string
  }>
  portfolioImages?: Array<{
    url: string
    alt?: string
    order?: number
    uploadedAt?: string
    uploadedBy?: string
    _id?: string
  }>
  features: { ar: string[]; en: string[] }
  deliveryFormats: string[]
  deliveryLinks: string[]
  nonRefundable: boolean
  isActive: boolean
  isFeatured: boolean
  order: number
  uiTexts?: {
    customFeatures?: Array<{
      title: string
      desc: string
      icon?: string
      color?: string
    }>
    workSteps?: Array<{
      title: string
      desc: string
    }>
    shortDescription?: string
    detailsTitle?: { ar?: string; en?: string } | string
    details?: { ar?: string; en?: string }
    qualityTitle?: { ar?: string; en?: string }
    qualitySubtitle?: { ar?: string; en?: string }
    noticeTitle?: { ar?: string; en?: string }
    notice?: { ar?: string; en?: string }
    detailsPoints?: string[]
    qualityPoints?: string[]
    noticePoints?: string[]
  }
  digitalDelivery?: {
    type: 'links'
    links: Array<{
      title?: string
      url: string
      imageUrl?: string
      locale?: 'ar' | 'en' | 'mixed'
      tags?: string[]
    }>
  }
  meta?: {
    seo?: {
      keywords: string[]
    }
    analytics?: {
      views: number
      orders: number
    }
    tags?: string[]
  }
  createdAt: string
  updatedAt: string
}
