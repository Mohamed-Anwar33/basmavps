import express from 'express';
import {
  getAllPolicies,
  getPolicyVersions,
  createPolicy,
  updatePolicy,
  publishPolicy,
  createPolicyVersion,
  importFromSettings,
  previewPolicy
} from '../../controllers/admin/policyContentController.js';
import { adminAuth } from '../../middleware/adminAuth.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(adminAuth);

// Policy content management routes
router.get('/policies', getAllPolicies);
router.get('/policies/:policyType', getPolicyVersions);
router.post('/policies', createPolicy);
router.put('/policies/:id', updatePolicy);
router.post('/policies/:id/publish', publishPolicy);
router.post('/policies/:id/version', createPolicyVersion);
router.post('/policies/import', importFromSettings);
router.get('/policies/preview/:id', previewPolicy);

export default router;
