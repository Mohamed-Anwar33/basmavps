import express from 'express';
import { 
  getBlogs as getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  publishBlog,
  unpublishBlog,
  getBlogStatistics,
  uploadBlogCover
} from '../../controllers/admin/blogAdminController.js';
import { validateSchema, blogSchema } from '../../middleware/validation.js';
import { upload } from '../../controllers/admin/mediaAdminController.js';

const router = express.Router();

// Authentication is applied at parent router via adminAuth

// Blog CRUD operations
router.get('/', getAllBlogs);
router.get('/statistics', getBlogStatistics);
router.get('/:id', getBlogById);
router.post('/', validateSchema(blogSchema), createBlog);
router.put('/:id', validateSchema(blogSchema), updateBlog);
router.delete('/:id', deleteBlog);

// Blog status operations
router.patch('/:id/publish', publishBlog);
router.patch('/:id/unpublish', unpublishBlog);

// Blog cover upload
router.post('/upload-cover', upload.single('coverImage'), uploadBlogCover);

export default router;
