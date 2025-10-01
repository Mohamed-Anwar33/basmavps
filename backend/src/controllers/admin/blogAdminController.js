import Blog from '../../models/Blog.js';
import AuditLog from '../../models/AuditLog.js';
import slugify from 'slugify';
import { createAuditLog } from '../../utils/auditLogger.js';

// Helpers to normalize multilingual or string inputs
const toMultilingual = (value, fallbackAr = '', fallbackEn = '') => {
  if (!value && !fallbackAr && !fallbackEn) return { ar: '', en: '' };
  if (typeof value === 'object' && value !== null) {
    // Already multilingual-like
    return {
      ar: value.ar ?? fallbackAr ?? '',
      en: value.en ?? fallbackEn ?? ''
    };
  }
  // Single string -> replicate to both
  return { ar: value ?? fallbackAr ?? '', en: value ?? fallbackEn ?? '' };
};

const toArray = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map(t => t.trim()).filter(Boolean);
  return fallback || [];
};

/**
 * @swagger
 * tags:
 *   name: Admin Blogs
 *   description: Admin blog management endpoints
 */

/**
 * @swagger
 * /api/admin/blogs:
 *   get:
 *     summary: Get all blogs for admin
 *     tags: [Admin Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived, all]
 *           default: all
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 */
export const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status = 'all', author } = req.query;

    const filter = {};
    if (search) {
      filter.$text = { $search: search };
    }
    if (status !== 'all') {
      filter.status = status;
    }
    if (author) {
      filter.authorId = author;
    }

    const skip = (page - 1) * limit;
    const blogs = await Blog.find(filter)
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(filter);

    const transformedBlogs = blogs.map(blog => ({
      ...blog.toObject(),
      isPublished: blog.status === 'published',
      isFeatured: blog.meta?.featured || false,
      author: blog.authorId ? {
        name: blog.authorId.name || blog.authorId.username || 'مجهول'
      } : { name: 'مجهول' }
    }));

    // Log admin action
    await AuditLog.logAction(req.user._id, 'view', 'blogs', null, { filter }, req);
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.json({
      success: true,
      data: {
        blogs: transformedBlogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve blogs'
    });
  }
};

/**
 * @swagger
 * /api/admin/blogs:
 *   post:
 *     summary: Create new blog
 *     tags: [Admin Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     responses:
 *       201:
 *         description: Blog created successfully
 */
export const createBlog = async (req, res) => {
  try {
    const blogData = req.body;
    const normalizedTitle = toMultilingual(blogData.title);
    const normalizedExcerpt = toMultilingual(blogData.excerpt);
    const normalizedContent = toMultilingual(blogData.content);
    const normalizedSeoTitle = toMultilingual(blogData.metaTitle);
    const normalizedSeoDesc = toMultilingual(blogData.metaDescription);

    // Coerce boolean-like inputs (create): optional
    const hasIsPublished = Object.prototype.hasOwnProperty.call(blogData, 'isPublished');
    const hasIsFeatured = Object.prototype.hasOwnProperty.call(blogData, 'isFeatured');
    const isPublished = hasIsPublished ? (blogData.isPublished === true || blogData.isPublished === 'true') : undefined;
    const isFeatured = hasIsFeatured ? (blogData.isFeatured === true || blogData.isFeatured === 'true') : undefined;

    const transformedData = {
      title: normalizedTitle,
      excerpt: normalizedExcerpt,
      content: normalizedContent,
      category: (typeof blogData.category === 'string' && blogData.category.trim() !== '')
        ? blogData.category.trim().toLowerCase()
        : undefined,
      coverImage: blogData.featuredImage || blogData.coverImage,
      status: isPublished === undefined ? (blogData.status || 'published') : (isPublished ? 'published' : 'draft'),
      tags: toArray(blogData.tags),
      authorId: req.user._id,
      meta: {
        seo: {
          title: normalizedSeoTitle,
          description: normalizedSeoDesc,
          keywords: toArray(blogData.keywords)
        },
        featured: isFeatured === undefined ? false : isFeatured
      }
    };

    // Generate slug if not provided
    if (!blogData.slug && (normalizedTitle.en || normalizedTitle.ar)) {
      const sourceTitle = normalizedTitle.en || normalizedTitle.ar;
      transformedData.slug = slugify(sourceTitle, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
    } else {
      transformedData.slug = blogData.slug;
    }

    // Check if slug already exists
    if (transformedData.slug) {
      const existingBlog = await Blog.findOne({ slug: transformedData.slug });
      if (existingBlog) {
        return res.status(400).json({
          success: false,
          error: 'Blog with this slug already exists'
        });
      }
    }

    const blog = new Blog(transformedData);
    const savedBlog = await blog.save();
    console.log('🔧 Blog saved with ID:', savedBlog._id);
    
    // Populate author
    await savedBlog.populate('authorId', 'name email');

    // Log admin action
    await AuditLog.logAction(req.user._id, 'create', 'blogs', blog._id, {
      title: blog.title,
      slug: blog.slug,
      status: blog.status
    }, req);

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: { blog: savedBlog }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create blog'
    });
  }
};

/**
 * @swagger
 * /api/admin/blogs/{id}:
 *   get:
 *     summary: Get blog by ID
 *     tags: [Admin Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *       404:
 *         description: Blog not found
 */
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id).populate('authorId', 'name email');
    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    res.json({
      success: true,
      data: { blog }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve blog'
    });
  }
};

/**
 * @swagger
 * /api/admin/blogs/{id}:
 *   put:
 *     summary: Update blog
 *     tags: [Admin Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       404:
 *         description: Blog not found
 */
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blogData = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    const normalizedTitle = toMultilingual(blogData.title, blog.title?.ar, blog.title?.en);
    const normalizedExcerpt = toMultilingual(blogData.excerpt, blog.excerpt?.ar, blog.excerpt?.en);
    const normalizedContent = toMultilingual(blogData.content, blog.content?.ar, blog.content?.en);
    const normalizedSeoTitle = toMultilingual(blogData.metaTitle, blog.meta?.seo?.title?.ar, blog.meta?.seo?.title?.en);
    const normalizedSeoDesc = toMultilingual(blogData.metaDescription, blog.meta?.seo?.description?.ar, blog.meta?.seo?.description?.en);

    const hasIsPublishedU = Object.prototype.hasOwnProperty.call(blogData, 'isPublished');
    const hasIsFeaturedU = Object.prototype.hasOwnProperty.call(blogData, 'isFeatured');
    const isPublished = hasIsPublishedU ? (blogData.isPublished === true || blogData.isPublished === 'true') : undefined;
    const isFeatured = hasIsFeaturedU ? (blogData.isFeatured === true || blogData.isFeatured === 'true') : undefined;

    const transformedData = {
      title: normalizedTitle,
      excerpt: normalizedExcerpt,
      content: normalizedContent,
      coverImage: blogData.featuredImage || blogData.coverImage || blog.coverImage,
      category: (typeof blogData.category === 'string')
        ? (blogData.category.trim() === '' ? blog.category : blogData.category.trim().toLowerCase())
        : blog.category,
      status: isPublished === undefined ? (blogData.status || blog.status) : (isPublished ? 'published' : 'draft'),
      tags: toArray(blogData.tags, blog.tags),
      meta: {
        ...blog.meta,
        seo: {
          ...blog.meta?.seo,
          title: normalizedSeoTitle,
          description: normalizedSeoDesc,
          keywords: toArray(blogData.keywords, blog.meta?.seo?.keywords || [])
        },
        featured: isFeatured === undefined ? (blog.meta?.featured ?? false) : isFeatured
      }
    };

    // Update slug if provided
    if (blogData.slug && blogData.slug !== blog.slug) {
      const existingBlog = await Blog.findOne({ slug: blogData.slug });
      if (existingBlog) {
        return res.status(400).json({
          success: false,
          error: 'Blog with this slug already exists'
        });
      }
      transformedData.slug = blogData.slug;
    }

    const oldData = blog.toObject();
    Object.assign(blog, transformedData);
    await blog.save();

    // Populate author
    await blog.populate('authorId', 'name email');

    // Log admin action
    await AuditLog.logAction(req.user._id, 'update', 'blogs', blog._id, {
      before: { title: oldData.title, slug: oldData.slug, status: oldData.status },
      after: { title: blog.title, slug: blog.slug, status: blog.status }
    }, req);

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: { blog }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update blog'
    });
  }
};

/**
 * @swagger
 * /api/admin/blogs/{id}:
 *   delete:
 *     summary: Delete blog
 *     tags: [Admin Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *       404:
 *         description: Blog not found
 */
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    await Blog.findByIdAndDelete(id);

    // Log admin action
    await AuditLog.logAction(req.user._id, 'delete', 'blogs', id, {
      title: blog.title,
      slug: blog.slug
    }, req);

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete blog'
    });
  }
};

/**
 * @swagger
 * /api/admin/blogs/{id}/publish:
 *   post:
 *     summary: Publish blog
 *     tags: [Admin Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog published successfully
 *       404:
 *         description: Blog not found
 */
export const publishBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    blog.status = 'published';
    blog.publishedAt = new Date();
    await blog.save();

    // Log admin action
    await AuditLog.logAction(req.user._id, 'update', 'blogs', blog._id, {
      action: 'published',
      oldStatus: blog.status,
      newStatus: 'published'
    }, req);

    res.json({
      success: true,
      message: 'Blog published successfully',
      data: { blog }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to publish blog'
    });
  }
};

/**
 * @swagger
 * /api/admin/blogs/{id}/unpublish:
 *   post:
 *     summary: Unpublish blog
 *     tags: [Admin Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog unpublished successfully
 *       404:
 *         description: Blog not found
 */
export const unpublishBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    const oldStatus = blog.status;
    blog.status = 'draft';
    blog.publishedAt = null;
    await blog.save();

    // Log admin action
    await AuditLog.logAction(req.user._id, 'update', 'blogs', blog._id, {
      action: 'unpublished',
      oldStatus: oldStatus,
      newStatus: 'draft'
    }, req);

    res.json({
      success: true,
      message: 'Blog unpublished successfully',
      data: { blog }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to unpublish blog'
    });
  }
};

// Upload blog cover image
export const uploadBlogCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Ù„Ù… ÙŠØªÙ… Ø±ÙØ¹ Ø£ÙŠ Ù…Ù„Ù'
      });
    }

    const coverImageData = {
      url: req.file.path,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype
    };

    let updatedBlog = null;
    const { blogId } = req.body || {};

    // If a blogId is provided, update the blog's coverImage field
    if (blogId) {
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Ø§Ù„Ù…Ø¯ÙˆÙ†Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©'
        });
      }

      const oldCover = blog.coverImage;
      blog.coverImage = coverImageData.url;
      await blog.save();
      updatedBlog = blog;

      // Log update action
      await AuditLog.logAction(req.user?._id || req.admin?.id, 'update', 'blogs', blog._id, {
        before: { coverImage: oldCover },
        after: { coverImage: blog.coverImage }
      }, req);
    }

    // Create audit log for the upload event
    await createAuditLog({
      adminId: req.user?._id || req.admin?.id,
      action: 'UPLOAD',
      resource: 'BlogCover',
      details: 'Uploaded blog cover image',
      metadata: { 
        filename: req.file.filename,
        originalName: req.file.originalname,
        blogUpdated: !!updatedBlog,
        blogId: updatedBlog?._id
      }
    });

    res.json({
      success: true,
      message: updatedBlog ? 'ØªÙ… Ø±ÙØ¹ ÙˆØªØ­Ø¯ÙŠØ« ØµÙˆØ±Ø© Ø§Ù„ØºÙ„Ø§Ù Ø¨Ù†Ø¬Ø§Ø­' : 'ØªÙ… Ø±ÙØ¹ ØµÙˆØ±Ø© Ø§Ù„ØºÙ„Ø§Ù Ø¨Ù†Ø¬Ø§Ø­',
      data: {
        cover: coverImageData,
        blog: updatedBlog ? {
          id: updatedBlog._id,
          coverImage: updatedBlog.coverImage,
          slug: updatedBlog.slug,
          title: updatedBlog.title,
          status: updatedBlog.status
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø±ÙØ¹ ØµÙˆØ±Ø© Ø§Ù„ØºÙ„Ø§Ù'
    });
  }
};
// Get blog statistics
export const getBlogStatistics = async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ status: 'published' });
    const draftBlogs = await Blog.countDocuments({ status: 'draft' });
    const archivedBlogs = await Blog.countDocuments({ status: 'archived' });
    const featuredBlogs = await Blog.countDocuments({ 'meta.featured': true });

    // Get total views
    const viewsResult = await Blog.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    res.json({
      success: true,
      data: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        archivedBlogs,
        featuredBlogs,
        totalViews
      }
    });
  } catch (error) {
    console.error('Blog statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ù…Ø¯ÙˆÙ†Ø©'
    });
  }
};
