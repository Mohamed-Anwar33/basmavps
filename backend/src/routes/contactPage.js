import express from 'express'
import { 
  getContactPageContent, 
  getContactPageSEO,
  createInitialContactContent
} from '../controllers/contactPageController.js'

const router = express.Router()

// Public routes
router.get('/', getContactPageContent)
router.get('/seo', getContactPageSEO)
router.post('/init', createInitialContactContent)

export default router
