import express from 'express';
import { submitContact } from '../controllers/contactController.js';
import { validateSchema, contactSchema } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/', validateSchema(contactSchema), submitContact);

export default router;
