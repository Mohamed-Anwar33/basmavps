import PolicyContent from '../../models/PolicyContent.js';
import Setting from '../../models/Setting.js';
import AuditLog from '../../models/AuditLog.js';

/**
 * @swagger
 * tags:
 *   name: Policy Content Admin
 *   description: Policy content management endpoints for admin
 */

/**
 * @swagger
 * /api/admin/policies:
 *   get:
 *     summary: Get all policy contents with versions
 *     tags: [Policy Content Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: policyType
 *         schema:
 *           type: string
 *           enum: [terms, refund, privacy, delivery, cookies, disclaimer]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *           enum: [ar, en, both]
 *     responses:
 *       200:
 *         description: Policy contents retrieved successfully
 */
export const getAllPolicies = async (req, res) => {
  try {
    const { policyType, status, locale } = req.query;
    
    const filter = {};
    if (policyType) filter.policyType = policyType;
    if (status) filter.status = status;
    if (locale) filter.locale = { $in: [locale, 'both'] };
    
    const policies = await PolicyContent.find(filter)
      .sort({ policyType: 1, version: -1 })
      .populate('createdBy lastEditedBy', 'name email')
      .lean();
    
    // Group by policy type and get latest versions
    const groupedPolicies = {};
    policies.forEach(policy => {
      if (!groupedPolicies[policy.policyType]) {
        groupedPolicies[policy.policyType] = {
          latest: policy,
          versions: []
        };
      }
      groupedPolicies[policy.policyType].versions.push(policy);
    });
    
    res.json({
      success: true,
      data: groupedPolicies
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve policies'
    });
  }
};

/**
 * @swagger
 * /api/admin/policies/{policyType}:
 *   get:
 *     summary: Get specific policy with all versions
 *     tags: [Policy Content Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: policyType
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Policy versions retrieved successfully
 */
export const getPolicyVersions = async (req, res) => {
  try {
    const { policyType } = req.params;
    
    const versions = await PolicyContent.getPolicyVersions(policyType);
    
    res.json({
      success: true,
      data: versions
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve policy versions'
    });
  }
};

/**
 * @swagger
 * /api/admin/policies:
 *   post:
 *     summary: Create new policy content
 *     tags: [Policy Content Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PolicyContent'
 *     responses:
 *       201:
 *         description: Policy content created successfully
 */
export const createPolicy = async (req, res) => {
  try {
    const policyData = {
      ...req.body,
      createdBy: req.admin.id,
      lastEditedBy: req.admin.id,
      version: 1
    };
    
    const policy = new PolicyContent(policyData);
    await policy.save();
    
    // Log the action
    await AuditLog.create({
      actorId: req.admin.id,
      action: 'create',
      collectionName: 'PolicyContent',
      documentId: policy._id,
      meta: {
        policyType: policy.policyType,
        version: policy.version
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø³ÙŠØ§Ø³Ø© Ø¨Ù†Ø¬Ø§Ø­',
      data: policy
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create policy'
    });
  }
};

/**
 * @swagger
 * /api/admin/policies/{id}:
 *   put:
 *     summary: Update policy content
 *     tags: [Policy Content Admin]
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
 *             $ref: '#/components/schemas/PolicyContent'
 *     responses:
 *       200:
 *         description: Policy content updated successfully
 */
export const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      lastEditedBy: req.admin.id,
      lastEditedAt: new Date()
    };
    
    const policy = await PolicyContent.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }
    
    // Log the action
    await AuditLog.create({
      actorId: req.admin.id,
      action: 'update',
      collectionName: 'PolicyContent',
      documentId: policy._id,
      meta: {
        policyType: policy.policyType,
        version: policy.version,
        changes: Object.keys(req.body)
      }
    });
    
    res.json({
      success: true,
      message: 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø³ÙŠØ§Ø³Ø© Ø¨Ù†Ø¬Ø§Ø­',
      data: policy
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update policy'
    });
  }
};

/**
 * @swagger
 * /api/admin/policies/{id}/publish:
 *   post:
 *     summary: Publish policy version
 *     tags: [Policy Content Admin]
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
 *         description: Policy published successfully
 */
export const publishPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    
    const policy = await PolicyContent.findById(id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }
    
    // Archive current published version
    await PolicyContent.updateMany(
      { policyType: policy.policyType, status: 'published' },
      { status: 'archived' }
    );
    
    // Publish this version
    policy.status = 'published';
    policy.effectiveDate = new Date();
    policy.lastEditedBy = req.admin.id;
    await policy.save();
    
    // Update settings table for backward compatibility
    await Setting.findOneAndUpdate(
      { key: policy.policyType, category: 'policies' },
      {
        key: policy.policyType,
        category: 'policies',
        value: policy.content.sections.map(s => s.content.ar).join('\n\n'),
        lang: 'ar',
        isActive: true
      },
      { upsert: true, new: true }
    );
    
    // Log the action
    await AuditLog.create({
      actorId: req.admin.id,
      action: 'publish', 
      collectionName: 'PolicyContent',
      documentId: policy._id,
      meta: {
        policyType: policy.policyType,
        version: policy.version
      }
    });
    
    res.json({
      success: true,
      message: 'ØªÙ… Ù†Ø´Ø± Ø§Ù„Ø³ÙŠØ§Ø³Ø© Ø¨Ù†Ø¬Ø§Ø­',
      data: policy
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to publish policy'
    });
  }
};

/**
 * @swagger
 * /api/admin/policies/{id}/version:
 *   post:
 *     summary: Create new version of policy
 *     tags: [Policy Content Admin]
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
 *             type: object
 *             properties:
 *               revisionNotes:
 *                 type: string
 *     responses:
 *       201:
 *         description: New policy version created successfully
 */
export const createPolicyVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const { revisionNotes, ...updateData } = req.body;
    
    const currentPolicy = await PolicyContent.findById(id);
    if (!currentPolicy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }
    
    const newVersion = await currentPolicy.createNewVersion({
      ...updateData,
      revisionNotes
    }, req.admin.id);
    
    // Log the action
    await AuditLog.create({
      actorId: req.admin.id,
      action: 'version',
      collectionName: 'PolicyContent',
      documentId: newVersion._id,
      meta: {
        policyType: newVersion.policyType,
        version: newVersion.version,
        previousVersion: currentPolicy.version
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø¥ØµØ¯Ø§Ø± Ø¬Ø¯ÙŠØ¯ Ø¨Ù†Ø¬Ø§Ø­',
      data: newVersion
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create policy version'
    });
  }
};

/**
 * @swagger
 * /api/admin/policies/import:
 *   post:
 *     summary: Import policies from current settings
 *     tags: [Policy Content Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Policies imported successfully
 */
export const importFromSettings = async (req, res) => {
  try {
    const settings = await Setting.find({ category: 'policies' });
    const imported = [];
    
    for (const setting of settings) {
      // Check if policy already exists
      const existingPolicy = await PolicyContent.findOne({
        policyType: setting.key,
        status: 'published'
      });
      
      if (!existingPolicy) {
        const policyData = {
          policyType: setting.key,
          content: {
            sections: [{
              id: 'main',
              title: {
                ar: getPolicyTitle(setting.key),
                en: getPolicyTitleEn(setting.key)
              },
              content: {
                ar: setting.value,
                en: ''
              },
              order: 0,
              isActive: true
            }],
            attachments: []
          },
          effectiveDate: setting.createdAt || new Date(),
          locale: 'ar',
          status: 'published',
          version: 1,
          createdBy: req.admin.id,
          lastEditedBy: req.admin.id,
          metadata: {
            metaTitle: {
              ar: getPolicyTitle(setting.key),
              en: getPolicyTitleEn(setting.key)
            },
            legalReviewRequired: true
          }
        };
        
        const policy = new PolicyContent(policyData);
        await policy.save();
        imported.push(policy);
      }
    }
    
    // Log the action
    await AuditLog.create({
      actorId: req.admin.id,
      action: 'import',
      collectionName: 'PolicyContent',
      meta: {
        importedCount: imported.length,
        policyTypes: imported.map(p => p.policyType)
      }
    });
    
    res.json({
      success: true,
      message: `ØªÙ… Ø§Ø³ØªÙŠØ±Ø§Ø¯ ${imported.length} Ø³ÙŠØ§Ø³Ø© Ø¨Ù†Ø¬Ø§Ø­`,
      data: imported
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to import policies'
    });
  }
};

/**
 * @swagger
 * /api/admin/policies/preview/{id}:
 *   get:
 *     summary: Preview policy content
 *     tags: [Policy Content Admin]
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
 *         description: Policy preview generated successfully
 */
export const previewPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    
    const policy = await PolicyContent.findById(id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }
    
    // Generate preview data compatible with frontend
    const previewData = {
      [policy.policyType]: policy.content.sections.map(s => s.content.ar).join('\n\n')
    };
    
    res.json({
      success: true,
      data: previewData,
      policy: {
        type: policy.policyType,
        version: policy.version,
        status: policy.status,
        effectiveDate: policy.effectiveDate
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate preview'
    });
  }
};

// Helper functions
function getPolicyTitle(key) {
  const titles = {
    terms: 'Ø§Ù„Ø´Ø±ÙˆØ· ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù…',
    refund: 'Ø³ÙŠØ§Ø³Ø© Ø¹Ø¯Ù… Ø§Ù„Ø§Ø³ØªØ±Ø¯Ø§Ø¯', 
    privacy: 'Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ©',
    delivery: 'Ø³ÙŠØ§Ø³Ø© Ø§Ù„ØªØ³Ù„ÙŠÙ…',
    cookies: 'Ø³ÙŠØ§Ø³Ø© Ù…Ù„ÙØ§Øª ØªØ¹Ø±ÙŠÙ Ø§Ù„Ø§Ø±ØªØ¨Ø§Ø·',
    disclaimer: 'Ø¥Ø®Ù„Ø§Ø¡ Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„ÙŠØ©'
  };
  return titles[key] || key;
}

function getPolicyTitleEn(key) {
  const titles = {
    terms: 'Terms and Conditions',
    refund: 'No Refund Policy',
    privacy: 'Privacy Policy', 
    delivery: 'Delivery Policy',
    cookies: 'Cookie Policy',
    disclaimer: 'Disclaimer'
  };
  return titles[key] || key;
}

