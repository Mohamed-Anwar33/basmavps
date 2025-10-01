import Blog from '../models/Blog.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Blog management endpoints
 */

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Get all published blogs with pagination and filtering
 *     tags: [Blogs]
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
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 */
export const getBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      tags,
      author,
      featured
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      tags: tags ? tags.split(',') : undefined,
      author,
      featured: featured !== undefined ? featured === 'true' : undefined
    };

    let blogs;
    if (search) {
      blogs = await Blog.search(search, options);
    } else {
      blogs = await Blog.findPublished(options);
    }

    const filter = { status: 'published' };
    if (tags) filter.tags = { $in: tags.split(',') };
    if (author) filter.authorId = author;
    if (featured !== undefined) filter['meta.featured'] = featured === 'true';
    if (search) filter.$text = { $search: search };

    const total = await Blog.countDocuments(filter);

    res.json({
      success: true,
      data: {
        blogs,
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
 * /api/blogs/featured:
 *   get:
 *     summary: Get featured blogs
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 3
 *     responses:
 *       200:
 *         description: Featured blogs retrieved successfully
 */
export const getFeaturedBlogs = async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    
    const blogs = await Blog.findFeatured(parseInt(limit));

    res.json({
      success: true,
      data: { blogs }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve featured blogs'
    });
  }
};

/**
 * @swagger
 * /api/blogs/recent:
 *   get:
 *     summary: Get recent blogs
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Recent blogs retrieved successfully
 */
export const getRecentBlogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const blogs = await Blog.findRecent(parseInt(limit));

    res.json({
      success: true,
      data: { blogs }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve recent blogs'
    });
  }
};

/**
 * @swagger
 * /api/blogs/{slug}:
 *   get:
 *     summary: Get blog by slug
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *       404:
 *         description: Blog not found
 */
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, status: 'published' })
      .populate('author', 'name email avatar');

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    // Increment views
    await blog.incrementViews();

    // Log view if user is authenticated
    if (req.user) {
      await AuditLog.logAction(req.user._id, 'view', 'blogs', blog._id, null, req);
    }

    // Get related blogs (same tags)
    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      status: 'published',
      tags: { $in: blog.tags }
    })
      .populate('author', 'name email avatar')
      .limit(3)
      .sort({ publishedAt: -1 });

    res.json({
      success: true,
      data: { 
        blog,
        relatedBlogs
      }
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
 * /api/blogs/tags:
 *   get:
 *     summary: Get all blog tags with counts
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 */
export const getBlogTags = async (req, res) => {
  try {
    const tags = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    const formattedTags = tags.map(tag => ({
      name: tag._id,
      count: tag.count
    }));

    res.json({
      success: true,
      data: { tags: formattedTags }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tags'
    });
  }
};

