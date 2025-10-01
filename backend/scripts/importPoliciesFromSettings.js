import mongoose from 'mongoose';
import Setting from '../src/models/Setting.js';
import PolicyContent from '../src/models/PolicyContent.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script to import existing policy settings into the new PolicyContent system
 * This creates a migration path from the old settings-based system to the new versioned system
 */

async function importPoliciesFromSettings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Get all existing policy settings
    const policySettings = await Setting.find({ category: 'policies' }).lean();

    const importResults = [];

    for (const setting of policySettings) {
      
      // Check if policy already exists in new system
      const existingPolicy = await PolicyContent.findOne({
        policyType: setting.key,
        status: 'published'
      });

      if (existingPolicy) {
        importResults.push({
          policyType: setting.key,
          status: 'skipped',
          reason: 'Already exists',
          existingVersion: existingPolicy.version
        });
        continue;
      }

      // Create policy title mappings
      const titleMappings = {
        terms: { ar: 'الشروط والأحكام', en: 'Terms and Conditions' },
        refund: { ar: 'سياسة عدم الاسترداد', en: 'No Refund Policy' },
        privacy: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
        delivery: { ar: 'سياسة التسليم', en: 'Delivery Policy' }
      };

      // Split content into sections if it contains multiple paragraphs
      const content = setting.value || '';
      const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
      
      const sections = paragraphs.map((paragraph, index) => ({
        id: `section_${index + 1}`,
        title: {
          ar: index === 0 ? titleMappings[setting.key]?.ar || setting.key : `البند ${index + 1}`,
          en: index === 0 ? titleMappings[setting.key]?.en || setting.key : `Section ${index + 1}`
        },
        content: {
          ar: paragraph.trim(),
          en: '' // Will be filled later with translations
        },
        order: index,
        isActive: true
      }));

      // Create the new PolicyContent document
      const policyData = {
        policyType: setting.key,
        content: {
          sections,
          attachments: []
        },
        effectiveDate: setting.createdAt || new Date(),
        locale: 'ar',
        status: 'published',
        version: 1,
        metadata: {
          metaTitle: titleMappings[setting.key] || { ar: setting.key, en: setting.key },
          metaDescription: {
            ar: `سياسة ${titleMappings[setting.key]?.ar || setting.key} لشركة بصمة تصميم`,
            en: `${titleMappings[setting.key]?.en || setting.key} for Basma Design`
          },
          lastReviewDate: setting.updatedAt || setting.createdAt,
          nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          legalReviewRequired: true
        },
        // Note: createdBy and lastEditedBy will be set to first admin user
        revisionNotes: 'تم الاستيراد من نظام الإعدادات القديم'
      };

      // Find first admin user to assign as creator
      const adminUser = await mongoose.connection.db.collection('users').findOne({ role: 'admin' });
      const adminId = adminUser?._id || new mongoose.Types.ObjectId();
      
      policyData.createdBy = adminId;
      policyData.lastEditedBy = adminId;

      // Create and save the policy
      const policy = new PolicyContent(policyData);
      await policy.save();

      
      importResults.push({
        policyType: setting.key,
        status: 'imported',
        version: 1,
        sectionsCount: sections.length,
        originalLength: content.length,
        createdAt: policy.createdAt
      });
    }

    // Generate import summary
    console.log('\n' + '='.repeat(60));
    console.log('='.repeat(60));
    
    const imported = importResults.filter(r => r.status === 'imported');
    const skipped = importResults.filter(r => r.status === 'skipped');
    

    if (imported.length > 0) {
      imported.forEach(item => {
      });
    }

    if (skipped.length > 0) {
      skipped.forEach(item => {
        `);
      });
    }

    
    // Export import results as JSON for reference
    const exportData = {
      importDate: new Date().toISOString(),
      totalProcessed: importResults.length,
      imported: imported.length,
      skipped: skipped.length,
      results: importResults,
      metadata: {
        sourceSystem: 'settings',
        targetSystem: 'policyContent',
        migrationVersion: '1.0'
      }
    };


    await mongoose.disconnect();
    return exportData;

  } catch (error) {
    throw error;
  }
}

// Run the import if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importPoliciesFromSettings()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default importPoliciesFromSettings;
