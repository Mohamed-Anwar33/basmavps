import Setting from '../../models/Setting.js';
import AuditLog from '../../models/AuditLog.js';

/**
 * @swagger
 * tags:
 *   name: Admin Settings
 *   description: Admin settings management endpoints
 */

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Get settings by category
 *     tags: [Admin Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [home, about, footer, policies, hero, contact, general]
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [ar, en, both]
 *           default: both
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 */
export const getSettings = async (req, res) => {
  try {
    const { category, lang = 'both' } = req.query;

    // If no category specified, return all settings
    if (!category) {
      const allSettings = await Setting.find({}).sort({ category: 1, key: 1 });
      return res.json({
        success: true,
        data: allSettings
      });
    }

    const settings = await Setting.getByCategory(category, lang);

    // Log admin action
    await AuditLog.logAction(req.user._id, 'view', 'settings', null, { category, lang }, req);

    res.json({
      success: true,
      data: { settings }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve settings'
    });
  }
};

/**
 * @swagger
 * /api/admin/settings:
 *   put:
 *     summary: Update or create setting
 *     tags: [Admin Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - category
 *               - value
 *             properties:
 *               key:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [home, about, footer, policies, hero, contact, general]
 *               value:
 *                 type: object
 *               lang:
 *                 type: string
 *                 enum: [ar, en, both]
 *                 default: both
 *               meta:
 *                 type: object
 *     responses:
 *       200:
 *         description: Setting updated successfully
 */
export const updateSetting = async (req, res) => {
  try {
    const { key, category, value, lang = 'both', meta } = req.body;

    const oldSetting = await Setting.getBySetting(key, category, lang);
    
    const setting = await Setting.updateSetting(key, category, value, lang, req.user._id);

    if (meta) {
      setting.meta = { ...setting.meta, ...meta };
      await setting.save();
    }

    // Log admin action
    await AuditLog.logAction(req.user._id, oldSetting ? 'update' : 'create', 'settings', setting._id, {
      key,
      category,
      lang,
      before: oldSetting?.value,
      after: value
    }, req);

    res.json({
      success: true,
      message: 'Setting updated successfully',
      data: { setting }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update setting'
    });
  }
};

/**
 * @swagger
 * /api/admin/settings/bulk:
 *   put:
 *     summary: Bulk update settings
 *     tags: [Admin Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - settings
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [home, about, footer, policies, hero, contact, general]
 *               settings:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     value:
 *                       type: object
 *                     lang:
 *                       type: string
 *                       enum: [ar, en, both]
 *                       default: both
 *     responses:
 *       200:
 *         description: Settings updated successfully
 */
export const bulkUpdateSettings = async (req, res) => {
  try {
    const { category, settings } = req.body;

    const updatedSettings = [];
    const changes = [];

    for (const settingData of settings) {
      const { key, value, lang = 'both' } = settingData;
      
      const oldSetting = await Setting.getBySetting(key, category, lang);
      const setting = await Setting.updateSetting(key, category, value, lang, req.user._id);
      
      updatedSettings.push(setting);
      changes.push({
        key,
        lang,
        before: oldSetting?.value,
        after: value
      });
    }

    // Log admin action
    await AuditLog.logAction(req.user._id, 'update', 'settings', null, {
      category,
      bulkUpdate: true,
      changes,
      count: settings.length
    }, req);

    res.json({
      success: true,
      message: `${settings.length} settings updated successfully`,
      data: { settings: updatedSettings }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update settings'
    });
  }
};

/**
 * @swagger
 * /api/admin/settings/{id}:
 *   delete:
 *     summary: Delete setting
 *     tags: [Admin Settings]
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
 *         description: Setting deleted successfully
 *       404:
 *         description: Setting not found
 */
export const deleteSetting = async (req, res) => {
  try {
    const { id } = req.params;

    const setting = await Setting.findById(id);
    if (!setting) {
      return res.status(404).json({
        success: false,
        error: 'Setting not found'
      });
    }

    await Setting.findByIdAndDelete(id);

    // Log admin action
    await AuditLog.logAction(req.user._id, 'delete', 'settings', id, {
      key: setting.key,
      category: setting.category,
      lang: setting.lang
    }, req);

    res.json({
      success: true,
      message: 'Setting deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete setting'
    });
  }
};

/**
 * Update settings by category
 */
export const updateSettingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const settingsData = req.body;

    const updatedSettings = [];
    const changes = [];

    for (const [key, value] of Object.entries(settingsData)) {
      if (value !== undefined && value !== null) {
        const oldSetting = await Setting.getBySetting(key, category, 'ar');
        const setting = await Setting.updateSetting(key, category, value, 'ar', req.user._id);
        
        updatedSettings.push(setting);
        changes.push({
          key,
          before: oldSetting?.value,
          after: value
        });
      }
    }

    // Log admin action
    await AuditLog.logAction(req.user._id, 'update', 'settings', null, {
      category,
      bulkUpdate: true,
      changes,
      count: changes.length
    }, req);

    res.json({
      success: true,
      message: `Settings for ${category} updated successfully`,
      data: { settings: updatedSettings }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update category settings'
    });
  }
};

