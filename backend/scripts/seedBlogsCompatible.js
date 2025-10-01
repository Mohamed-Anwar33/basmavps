import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Blog from '../src/models/Blog.js';

// Load env robustly (handles Windows paths and spaces)
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const envPath = join(__dirname, '../.env');
  dotenv.config({ path: envPath });
} catch (e) {
  dotenv.config();
}

// Helper to upsert by slug
async function upsertBlog(doc) {
  const existing = await Blog.findOne({ slug: doc.slug });
  if (existing) {
    // Update existing keeping createdAt
    Object.assign(existing, doc);
    await existing.save();
    return { doc: existing, created: false };
  } else {
    const created = await Blog.create(doc);
    return { doc: created, created: true };
  }
}

async function run() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ Missing MONGODB_URI in .env. Please set it and rerun.');
      process.exitCode = 1;
      return;
    }
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected');

    // NOTE: Set an existing admin/user ObjectId here if your schema requires authorId
    // Fallback to a deterministic ObjectId if not critical in your setup
    const fallbackAuthor = new mongoose.Types.ObjectId();

    const blogs = [
      {
        title: {
          ar: '5 نصائح لكتابة محتوى مدونة جذاب',
          en: '5 Tips for Writing Engaging Blog Content',
        },
        excerpt: {
          ar: 'تعرّف على أفضل الممارسات لصناعة محتوى يجذب القُراء ويزيد التفاعل.',
          en: 'Learn best practices to craft content that attracts readers and boosts engagement.',
        },
        content: {
          ar: '<h2>نصائح عملية</h2><ul><li>ابدأ بعنوان قوي</li><li>استخدم صورًا واضحة</li><li>قسّم الفقرات</li><li>قدّم قيمة حقيقية</li><li>اختم بدعوة لاتخاذ إجراء</li></ul>',
          en: '<h2>Practical Tips</h2><ul><li>Start with a strong title</li><li>Use clear images</li><li>Break paragraphs</li><li>Provide real value</li><li>End with a CTA</li></ul>',
        },
        category: 'business',
        tags: ['محتوى', 'كتابة', 'تسويق'],
        coverImage: 'https://res.cloudinary.com/dxtd3ltai/image/upload/v1733677800/blog/sample-business-1.jpg',
        status: 'published',
        meta: { featured: true, seo: { title: { ar: 'نصائح كتابة المحتوى', en: 'Content Writing Tips' } } },
        authorId: fallbackAuthor,
        slug: 'engaging-blog-content-tips',
      },
      {
        title: {
          ar: 'كيف تطلق حملة تسويق رقمي ناجحة',
          en: 'How to Launch a Successful Digital Marketing Campaign',
        },
        excerpt: {
          ar: 'خطوات عملية لتخطيط وتنفيذ حملة تسويق رقمي فعّالة.',
          en: 'Practical steps to plan and execute an effective digital marketing campaign.',
        },
        content: {
          ar: '<p>ابدأ بتحديد الهدف والجمهور، ثم اختر القنوات المناسبة، وصمم رسائل جذابة، وتابع النتائج KPIs.</p>',
          en: '<p>Start by defining goals and audience, choose the right channels, craft compelling messages, and track KPIs.</p>',
        },
        category: 'marketing',
        tags: ['تسويق', 'إعلانات', 'تحليل'],
        coverImage: 'https://res.cloudinary.com/dxtd3ltai/image/upload/v1733677800/blog/sample-marketing-1.jpg',
        status: 'published',
        meta: { featured: false, seo: { title: { ar: 'حملة تسويق رقمى', en: 'Digital Marketing Campaign' } } },
        authorId: fallbackAuthor,
        slug: 'successful-digital-marketing-campaign',
      },
      {
        title: {
          ar: 'مبادئ أساسية لتصميم مواقع ويب احترافية',
          en: 'Core Principles for Professional Web Design',
        },
        excerpt: {
          ar: 'تعلم أساسيات التصميم المتجاوب وتجربة المستخدم والبساطة.',
          en: 'Learn the basics of responsive design, UX, and simplicity.',
        },
        content: {
          ar: '<p>استخدم شبكة مرنة، حسن الأداء، واهتم بالتباين والمسافات لتجربة مريحة.</p>',
          en: '<p>Use flexible grids, optimize performance, and focus on contrast and spacing for a pleasant UX.</p>',
        },
        category: 'web-design',
        tags: ['ويب', 'تصميم', 'UX'],
        coverImage: 'https://res.cloudinary.com/dxtd3ltai/image/upload/v1733677800/blog/sample-webdesign-1.jpg',
        status: 'published',
        meta: { featured: true, seo: { title: { ar: 'تصميم مواقع ويب', en: 'Web Design' } } },
        authorId: fallbackAuthor,
        slug: 'professional-web-design-principles',
      },
    ];

    let created = 0; let updated = 0;
    for (const b of blogs) {
      const res = await upsertBlog(b);
      if (res.created) created++; else updated++;
    }

    console.log(`✅ Done. Created: ${created}, Updated: ${updated}`);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

run();
