import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const blogSchema = new mongoose.Schema({
  title: { ar: String, en: String },
  status: String,
  isPublished: Boolean,
  isFeatured: Boolean,
  publishedAt: Date,
  slug: String,
  meta: { featured: Boolean }
}, { strict: false });

const Blog = mongoose.model('Blog', blogSchema);

async function publishAllBlogs() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📝 Publishing all blog posts...');
    
    const result = await Blog.updateMany(
      {},
      { 
        $set: { 
          status: 'published',
          isPublished: true,
          publishedAt: new Date()
        }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} blog posts`);

    // Get updated blogs
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    
    console.log('\n📊 Updated Blog Posts:');
    blogs.forEach((blog, index) => {
      console.log(`📄 Blog ${index + 1}:`);
      console.log(`   Title: ${blog.title?.ar || 'No title'}`);
      console.log(`   Status: ${blog.status}`);
      console.log(`   Published: ${blog.isPublished ? 'Yes' : 'No'}`);
      console.log(`   Featured: ${blog.isFeatured ? 'Yes' : 'No'}`);
      console.log(`   Slug: ${blog.slug}`);
      console.log('   ---');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

publishAllBlogs();
