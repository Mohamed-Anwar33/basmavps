import mongoose from 'mongoose';
import Service from '../src/models/Service.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/basma-design', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const servicesData = [
  {
    title: { ar: 'تصميم بوست سوشيال ميديا', en: 'Social Media Post Design' },
    description: { 
      ar: 'تصميم بوستات احترافية لمنصات التواصل الاجتماعي بأعلى جودة وإبداع',
      en: 'Professional social media post design with highest quality and creativity'
    },
    price: { SAR: 50, USD: 13.33 },
    deliveryTime: { min: 1, max: 3 },
    revisions: 2,
    category: 'social-media',
    features: {
      ar: ['تصميم مبتكر وجذاب', 'جودة عالية', 'تسليم سريع', 'متوافق مع جميع المنصات'],
      en: ['Innovative and attractive design', 'High quality', 'Fast delivery', 'Compatible with all platforms']
    },
    deliveryFormats: ['PNG', 'JPG', 'PDF'],
    isActive: true,
    isFeatured: false,
    order: 1
  },
  {
    title: { ar: 'تصميم شعار للشركات والمتاجر', en: 'Logo Design for Companies and Stores' },
    description: { 
      ar: 'تصميم شعار احترافي يعبر عن هوية علامتك التجارية بشكل مميز وفريد',
      en: 'Professional logo design that represents your brand identity uniquely'
    },
    price: { SAR: 200, USD: 53.33 },
    deliveryTime: { min: 3, max: 7 },
    revisions: 3,
    category: 'branding',
    features: {
      ar: ['تصميم فريد ومميز', 'عدة اقتراحات', 'ملفات بجودة عالية', 'دعم فني مجاني'],
      en: ['Unique design', 'Multiple suggestions', 'High quality files', 'Free technical support']
    },
    deliveryFormats: ['AI', 'PNG', 'SVG', 'PDF'],
    isActive: true,
    isFeatured: true,
    order: 2
  },
  {
    title: { ar: 'إدارة حسابات السوشيال ميديا', en: 'Social Media Management' },
    description: { 
      ar: 'إدارة شاملة لحساباتك على منصات التواصل الاجتماعي مع المحتوى والتفاعل',
      en: 'Comprehensive management of your social media accounts with content and engagement'
    },
    price: { SAR: 500, USD: 133.33 },
    deliveryTime: { min: 1, max: 1 },
    revisions: 1,
    category: 'management',
    features: {
      ar: ['إدارة يومية', 'محتوى مميز', 'تفاعل مع العملاء', 'تقارير شهرية'],
      en: ['Daily management', 'Premium content', 'Customer engagement', 'Monthly reports']
    },
    deliveryFormats: ['تقرير PDF', 'محتوى جاهز'],
    isActive: true,
    isFeatured: true,
    order: 3
  },
  {
    title: { ar: 'تصميم بروشور أو فلاير', en: 'Brochure or Flyer Design' },
    description: { 
      ar: 'تصميم بروشورات وفلايرات احترافية للترويج لخدماتك ومنتجاتك',
      en: 'Professional brochure and flyer design to promote your services and products'
    },
    price: { SAR: 80, USD: 21.33 },
    deliveryTime: { min: 2, max: 4 },
    revisions: 2,
    category: 'print-design',
    features: {
      ar: ['تصميم طباعي احترافي', 'ألوان جذابة', 'محتوى منظم', 'جاهز للطباعة'],
      en: ['Professional print design', 'Attractive colors', 'Organized content', 'Print ready']
    },
    deliveryFormats: ['PDF', 'AI', 'PNG'],
    isActive: true,
    isFeatured: false,
    order: 4
  },
  {
    title: { ar: 'تصميم هوية تجارية متكاملة', en: 'Complete Brand Identity Design' },
    description: { 
      ar: 'تصميم هوية تجارية شاملة تتضمن الشعار والألوان والخطوط وجميع العناصر',
      en: 'Complete brand identity design including logo, colors, fonts and all elements'
    },
    price: { SAR: 800, USD: 213.33 },
    deliveryTime: { min: 7, max: 14 },
    revisions: 5,
    category: 'branding',
    features: {
      ar: ['شعار احترافي', 'دليل الهوية', 'ألوان وخطوط', 'نماذج تطبيقية'],
      en: ['Professional logo', 'Brand guide', 'Colors and fonts', 'Application examples']
    },
    deliveryFormats: ['AI', 'PDF', 'PNG', 'SVG'],
    isActive: true,
    isFeatured: true,
    order: 5
  }
];

async function restoreServicesContent() {
  try {
    
    // Get all services that might need content restoration
    const services = await Service.find({}).lean();
    
    let updatedCount = 0;
    
    for (const serviceData of servicesData) {
      // Find service by Arabic title
      const existingService = services.find(s => 
        s.title?.ar === serviceData.title.ar || 
        (typeof s.title === 'string' && s.title === serviceData.title.ar)
      );
      
      if (existingService) {
        
        const updateData = {
          title: serviceData.title,
          description: serviceData.description,
          price: serviceData.price,
          deliveryTime: serviceData.deliveryTime,
          revisions: serviceData.revisions,
          category: serviceData.category,
          features: serviceData.features,
          deliveryFormats: serviceData.deliveryFormats,
          isActive: serviceData.isActive,
          isFeatured: serviceData.isFeatured,
          order: serviceData.order,
          // Keep existing images and other fields
          images: existingService.images || [],
          uiTexts: existingService.uiTexts || {}
        };
        
        await Service.findByIdAndUpdate(existingService._id, updateData);
        updatedCount++;
      } else {
        
        const newService = new Service({
          ...serviceData,
          images: [],
          uiTexts: {}
        });
        
        await newService.save();
        updatedCount++;
      }
    }
    
    
  } catch (error) {
  } finally {
    mongoose.connection.close();
  }
}

// Run the restore function
restoreServicesContent();
