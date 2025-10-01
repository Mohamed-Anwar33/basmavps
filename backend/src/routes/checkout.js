import express from 'express';
import { saveTempOrderData, sendCheckoutEmailCode, verifyCheckoutEmailCode } from '../controllers/checkoutController.js';
import { validateSchema, checkoutSendCodeSchema, checkoutVerifyCodeSchema } from '../middleware/validation.js';

const router = express.Router();

// Public endpoints (guests need to access)
router.post('/save-temp-data', saveTempOrderData); // 🎯 حفظ البيانات المؤقتة
router.post('/email/send-code', validateSchema(checkoutSendCodeSchema), sendCheckoutEmailCode);
router.post('/email/verify', validateSchema(checkoutVerifyCodeSchema), verifyCheckoutEmailCode);

export default router;
