import ContactPageContent from '../models/ContactPageContent.js'
import mongoose from 'mongoose'
import { createError } from '../utils/createError.js'

// Get contact page content for public use
export const getContactPageContent = async (req, res, next) => {
  try {
    let contactContent = await ContactPageContent.findOne({ isActive: true })
    
    // If no content exists, create default content
    if (!contactContent) {
      contactContent = new ContactPageContent({})
      await contactContent.save()
    }

    // Transform data for frontend compatibility
    const transformedContent = {
      // Hero Section
      headerTitle: contactContent.heroTitle.ar,
      headerSubtitle: contactContent.heroSubtitle.ar,
      
      // Contact Info
      whatsappLink: contactContent.contactInfo.whatsappLink,
      email: contactContent.contactInfo.email,
      workingHoursText: contactContent.contactInfo.workingHours.ar,
      
      // Important Notes
      notes: contactContent.importantNotesSection.notes.map(note => note.ar),
      
      // Social Media
      socialInstagram: contactContent.socialMediaSection.platforms.instagram,
      socialTwitter: contactContent.socialMediaSection.platforms.twitter,
      socialLinkedin: contactContent.socialMediaSection.platforms.linkedin,
      socialTiktok: contactContent.socialMediaSection.platforms.tiktok
    }

    res.status(200).json({
      success: true,
      data: transformedContent
    })
  } catch (error) {
    next(createError('Failed to fetch contact page content', 500))
  }
}

// Get contact page content for admin
export const getContactPageContentAdmin = async (req, res, next) => {
  try {
    let contactContent = await ContactPageContent.findOne({ isActive: true })
    
    // If no content exists, create default content
    if (!contactContent) {
      contactContent = new ContactPageContent({})
      await contactContent.save()
    }

    res.status(200).json({
      success: true,
      data: contactContent
    })
  } catch (error) {
    next(createError('Failed to fetch contact page content for admin', 500))
  }
}

// Update contact page content (Admin only) - SIMPLIFIED VERSION
export const updateContactPageContent = async (req, res, next) => {
  try {
    const updateData = req.body || {}
    const adminId = req?.user?._id || req?.user?.id;
    
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة غير صحيح'
      });
    }

    // Find existing content
    let contactContent = await ContactPageContent.findOne({ isActive: true })
    
    if (!contactContent) {
      // Create new content with simple structure
      contactContent = new ContactPageContent({
        heroTitle: updateData.heroTitle || { ar: '', en: '' },
        heroSubtitle: updateData.heroSubtitle || { ar: '', en: '' },
        contactInfo: updateData.contactInfo || {},
        lastModifiedBy: new mongoose.Types.ObjectId(adminId),
        isActive: true
      })
    } else {
      // Simple update - only update provided fields
      if (updateData.heroTitle) {
        contactContent.heroTitle = {
          ...contactContent.heroTitle,
          ...updateData.heroTitle
        }
      }
      
      if (updateData.heroSubtitle) {
        contactContent.heroSubtitle = {
          ...contactContent.heroSubtitle, 
          ...updateData.heroSubtitle
        }
      }
      
      if (updateData.contactInfo) {
        contactContent.contactInfo = {
          ...contactContent.contactInfo,
          ...updateData.contactInfo
        }
      }
      
      // Update other sections if provided
      if (updateData.whatsappSection) {
        contactContent.whatsappSection = {
          ...contactContent.whatsappSection,
          ...updateData.whatsappSection
        }
      }
      
      if (updateData.emailSection) {
        contactContent.emailSection = {
          ...contactContent.emailSection,
          ...updateData.emailSection
        }
      }
      
      if (updateData.workingHoursSection) {
        contactContent.workingHoursSection = {
          ...contactContent.workingHoursSection,
          ...updateData.workingHoursSection
        }
      }
      
      if (updateData.socialMediaSection) {
        contactContent.socialMediaSection = {
          ...contactContent.socialMediaSection,
          ...updateData.socialMediaSection
        }
      }
      
      if (updateData.importantNotesSection) {
        contactContent.importantNotesSection = {
          ...contactContent.importantNotesSection,
          ...updateData.importantNotesSection
        }
      }
      
      if (updateData.seoSettings) {
        contactContent.seoSettings = {
          ...contactContent.seoSettings,
          ...updateData.seoSettings
        }
      }

      contactContent.lastModifiedBy = new mongoose.Types.ObjectId(adminId)
    }

    // Use findOneAndUpdate instead of save() to avoid DocumentNotFoundError
    const updateQuery = { isActive: true }
    const updateFields = {
      heroTitle: contactContent.heroTitle,
      heroSubtitle: contactContent.heroSubtitle,
      contactInfo: contactContent.contactInfo,
      whatsappSection: contactContent.whatsappSection,
      emailSection: contactContent.emailSection,
      workingHoursSection: contactContent.workingHoursSection,
      socialMediaSection: contactContent.socialMediaSection,
      importantNotesSection: contactContent.importantNotesSection,
      seoSettings: contactContent.seoSettings,
      lastModifiedBy: new mongoose.Types.ObjectId(adminId),
      $inc: { version: 1 }
    }

    const savedContent = await ContactPageContent.findOneAndUpdate(
      updateQuery,
      updateFields,
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    )

    return res.status(200).json({
      success: true,
      message: 'Contact page content updated successfully',
      data: savedContent
    })
  } catch (error) {
    // Enhanced error logging
    console.error('❌ Contact update error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      adminId: req?.user?._id || req?.user?.id,
      updateDataKeys: Object.keys(req.body || {})
    });
    
    return next(createError('Failed to update contact page content', 500))
  }
}

// Get SEO data for contact page
export const getContactPageSEO = async (req, res, next) => {
  try {
    const contactContent = await ContactPageContent.findOne({ isActive: true })
    
    if (!contactContent) {
      return res.status(404).json({
        success: false,
        message: 'Contact page content not found'
      })
    }

    const seoData = {
      title: contactContent.seoSettings.pageTitle.ar,
      description: contactContent.seoSettings.metaDescription.ar,
      keywords: contactContent.seoSettings.keywords.ar,
      openGraph: {
        title: contactContent.seoSettings.openGraph.title.ar,
        description: contactContent.seoSettings.openGraph.description.ar,
        image: contactContent.seoSettings.openGraph.image,
        url: contactContent.seoSettings.openGraph.url
      },
      twitter: {
        title: contactContent.seoSettings.twitter.title.ar,
        description: contactContent.seoSettings.twitter.description.ar,
        image: contactContent.seoSettings.twitter.image
      },
      canonical: contactContent.seoSettings.canonicalUrl
    }

    res.status(200).json({
      success: true,
      data: seoData
    })
  } catch (error) {
    next(createError('Failed to fetch contact page SEO data', 500))
  }
}

// Create initial contact page content (for seeding)
export const createInitialContactContent = async (req, res, next) => {
  try {
    const existingContent = await ContactPageContent.findOne({ isActive: true })
    
    if (existingContent) {
      return res.status(200).json({
        success: true,
        message: 'Contact page content already exists',
        data: existingContent
      })
    }

    // Create with default Arabic notes
    const defaultNotes = [
      {
        ar: 'لا يتم الرد على الطلبات غير المدفوعة أو غير المكتملة',
        en: 'No response to unpaid or incomplete requests'
      },
      {
        ar: 'لا يُعتمد أي تواصل عبر منصات أخرى (مثل إنستغرام أو تويتر) لتنفيذ الطلبات',
        en: 'No communication via other platforms (like Instagram or Twitter) for order execution'
      },
      {
        ar: 'جميع المحادثات تُدار باحترام متبادل، وأي تجاوز يُعد مخالفة تعاقدية',
        en: 'All conversations are managed with mutual respect, any violation is considered contractual breach'
      }
    ]

    const defaultKeywords = {
      ar: ['تواصل معنا', 'معلومات التواصل', 'واتساب بصمة تصميم', 'إيميل بصمة تصميم', 'استشارة مجانية', 'طلب خدمة تصميم', 'دعم العملاء', 'ساعات العمل'],
      en: ['contact us', 'contact information', 'basmat design whatsapp', 'basmat design email', 'free consultation', 'design service request', 'customer support', 'working hours']
    }

    const contactContent = new ContactPageContent({
      importantNotesSection: {
        ...ContactPageContent.schema.paths.importantNotesSection.defaultValue,
        notes: defaultNotes
      },
      seoSettings: {
        ...ContactPageContent.schema.paths.seoSettings.defaultValue,
        keywords: defaultKeywords
      }
    })

    await contactContent.save()

    res.status(201).json({
      success: true,
      message: 'Initial contact page content created successfully',
      data: contactContent
    })
  } catch (error) {
    next(createError('Failed to create initial contact page content', 500))
  }
}
