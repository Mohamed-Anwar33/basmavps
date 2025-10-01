import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Import Blog model
const blogSchema = new mongoose.Schema({
  title: {
    ar: String,
    en: String
  },
  content: {
    ar: String,
    en: String
  },
  excerpt: {
    ar: String,
    en: String
  },
  coverImage: String,
  category: String,
  tags: [String],
  isPublished: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  readingTime: Number,
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  slug: { type: String, unique: true },
  views: { type: Number, default: 0 },
  publishedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Blog = mongoose.model('Blog', blogSchema);

async function publishBlogPosts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    
    // Update all blogs to be published
    const updateResult = await Blog.updateMany(
      {},  // Update all blogs regardless of current status
      { 
        $set: { 
          isPublished: true,
          publishedAt: new Date()
        }
      }
    );


    // Make the first and third blog featured
    const featuredResult = await Blog.updateMany(
      { 
        $or: [
          { slug: "graphic-design-brand-success" },
          { slug: "responsive-web-design-guide" }
        ]
      },
      { 
        $set: { isFeatured: true }
      }
    );


    // Display updated blog posts
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    
    blogs.forEach((blog, index) => {
      console.log(`   Title (AR): ${blog.title.ar}`);
      console.log(`   Published At: ${blog.publishedAt ? blog.publishedAt.toLocaleString('ar-SA') : 'Not published'}`);
    });

    console.log(`   - Published blogs: ${blogs.filter(b => b.isPublished).length}`);
    console.log(`   - Featured blogs: ${blogs.filter(b => b.isFeatured).length}`);

  } catch (error) {
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

publishBlogPosts();
