import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Setting:
 *       type: object
 *       required:
 *         - key
 *         - category
 *         - value
 *       properties:
 *         _id:
 *           type: string
 *         key:
 *           type: string
 *           description: Setting key identifier
 *         category:
 *           type: string
 *           enum: [home, about, footer, policies, hero, contact, general, foundational, whatDifferent, counters, closingCta, social, legal, site]
 *         value:
 *           type: object
 *           description: Setting value (JSON object)
 *         lang:
 *           type: string
 *           enum: [ar, en, both]
 *           default: both
 *         isActive:
 *           type: boolean
 *           default: true
 *         meta:
 *           type: object
 */

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'Setting key is required'],
    trim: true,
    maxlength: [100, 'Key cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['home', 'about', 'footer', 'policies', 'hero', 'contact', 'general', 'foundational', 'whatDifferent', 'counters', 'closingCta', 'social', 'legal', 'site'],
    default: 'general'
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Value is required']
  },
  lang: {
    type: String,
    enum: ['ar', 'en', 'both'],
    default: 'both'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  meta: {
    description: String,
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    version: {
      type: Number,
      default: 1
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for key + category + lang uniqueness
settingSchema.index({ key: 1, category: 1, lang: 1 }, { unique: true });
settingSchema.index({ category: 1 });
settingSchema.index({ isActive: 1 });

// Static method to get settings by category
settingSchema.statics.getByCategory = function(category, lang = 'both') {
  const filter = { category, isActive: true };
  if (lang !== 'both') {
    filter.$or = [{ lang: lang }, { lang: 'both' }];
  }
  return this.find(filter);
};

// Static method to get setting by key and category
settingSchema.statics.getBySetting = function(key, category, lang = 'both') {
  const filter = { key, category, isActive: true };
  if (lang !== 'both') {
    filter.$or = [{ lang: lang }, { lang: 'both' }];
  }
  return this.findOne(filter);
};

// Static method to update or create setting
settingSchema.statics.updateSetting = async function(key, category, value, lang = 'both', userId = null) {
  const filter = { key, category, lang };
  const update = {
    value,
    'meta.lastModifiedBy': userId,
    $inc: { 'meta.version': 1 }
  };
  
  return this.findOneAndUpdate(filter, update, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true
  });
};

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;
