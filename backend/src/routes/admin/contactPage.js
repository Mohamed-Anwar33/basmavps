import express from 'express'
import { 
  getContactPageContentAdmin, 
  updateContactPageContent 
} from '../../controllers/contactPageController.js'
import { adminAuth } from '../../middleware/adminAuth.js'

const router = express.Router()

// All routes require admin authentication
router.use(adminAuth)

// Get contact page content for admin
router.get('/', getContactPageContentAdmin)

// Update contact page content
router.put('/', updateContactPageContent)

export default router
