import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Simple endpoint to update policies without complex admin auth
router.post('/update-policies', async (req, res) => {
  try {
    const policies = req.body;
    
    if (!policies || typeof policies !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid policies data'
      });
    }

    const db = mongoose.connection.db;
    let updatedCount = 0;

    // Update each policy
    for (const [key, value] of Object.entries(policies)) {
      if (['terms', 'refund', 'privacy', 'delivery'].includes(key)) {
        const result = await db.collection('settings').updateOne(
          { key, category: 'policies' },
          {
            $set: {
              value: value,
              updatedAt: new Date()
            }
          }
        );
        
        if (result.modifiedCount > 0) {
          updatedCount++;
        }
      }
    }

    res.json({
      success: true,
      message: `ØªÙ… ØªØ­Ø¯ÙŠØ« ${updatedCount} Ø³ÙŠØ§Ø³Ø§Øª Ø¨Ù†Ø¬Ø§Ø­`,
      updatedCount
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'ÙØ´Ù„ ÙÙŠ ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø³ÙŠØ§Ø³Ø§Øª',
      details: error.message
    });
  }
});

export default router;

