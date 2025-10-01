import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/basma-design');

// Define Setting schema (matching the actual model)
const settingSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: mongoose.Schema.Types.Mixed,
  category: { type: String, default: 'general' },
  lang: { type: String, enum: ['ar', 'en', 'both'], default: 'both' },
  isActive: { type: Boolean, default: true },
  meta: {
    description: String,
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    version: { type: Number, default: 1 }
  }
}, {
  timestamps: true
});

settingSchema.index({ key: 1, category: 1, lang: 1 }, { unique: true });
const Setting = mongoose.model('Setting', settingSchema);

async function cleanAndFixAboutData() {
  try {

    // Delete corrupted whyUs entries
    const deleteResult = await Setting.deleteMany({
      category: 'about',
      key: { $in: ['whyUsTitle', 'whyUsBody'] },
      value: { $regex: /\?\?\?/ }
    });
    

    // Insert clean data
    const cleanData = [
      {
        key: 'whyUsTitle',
        value: 'لماذا بصمة تصميم؟',
        category: 'about',
        lang: 'ar',
        isActive: true
      },
      {
        key: 'whyUsBody',
        value: 'نحن لا نقدم مجرد تصاميم، بل نصنع هويات بصرية تحكي قصة علامتك التجارية وتترك أثراً إيجابياً في أذهان جمهورك المستهدف.',
        category: 'about',
        lang: 'ar',
        isActive: true
      }
    ];

    for (const data of cleanData) {
      const result = await Setting.findOneAndUpdate(
        { key: data.key, category: data.category, lang: data.lang },
        data,
        { upsert: true, new: true }
      );
    }

    // Verify the fix
    const whyUsTitle = await Setting.findOne({ key: 'whyUsTitle', category: 'about', lang: 'ar' });
    const whyUsBody = await Setting.findOne({ key: 'whyUsBody', category: 'about', lang: 'ar' });
    


  } catch (error) {
  } finally {
    mongoose.connection.close();
  }
}

cleanAndFixAboutData();
