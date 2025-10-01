import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     FAQ:
 *       type: object
 *       required:
 *         - question
 *         - answer
 *       properties:
 *         _id:
 *           type: string
 *         question:
 *           type: object
 *           properties:
 *             ar:
 *               type: string
 *             en:
 *               type: string
 *         answer:
 *           type: object
 *           properties:
 *             ar:
 *               type: string
 *             en:
 *               type: string
 *         category:
 *           type: string
 *         order:
 *           type: number
 *           default: 0
 *         isActive:
 *           type: boolean
 *           default: true
 *         meta:
 *           type: object
 */

const faqSchema = new mongoose.Schema({
  question: {
    ar: {
      type: String,
      required: [true, 'Arabic question is required'],
      trim: true,
      maxlength: [300, 'Question cannot exceed 300 characters']
    },
    en: {
      type: String,
      required: [true, 'English question is required'],
      trim: true,
      maxlength: [300, 'Question cannot exceed 300 characters']
    }
  },
  answer: {
    ar: {
      type: String,
      required: [true, 'Arabic answer is required'],
      trim: true,
      maxlength: [1000, 'Answer cannot exceed 1000 characters']
    },
    en: {
      type: String,
      required: [true, 'English answer is required'],
      trim: true,
      maxlength: [1000, 'Answer cannot exceed 1000 characters']
    }
  },
  category: {
    type: String,
    trim: true,
    default: 'general',
    enum: ['general', 'services', 'payment', 'pricing', 'delivery', 'support', 'design', 'quality', 'files', 'formats']
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  meta: {
    views: {
      type: Number,
      default: 0
    },
    helpful: {
      type: Number,
      default: 0
    },
    notHelpful: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
faqSchema.index({ category: 1 });
faqSchema.index({ order: 1 });
faqSchema.index({ isActive: 1 });
faqSchema.index({ 'question.ar': 'text', 'question.en': 'text', 'answer.ar': 'text', 'answer.en': 'text' });

// Static method to find active FAQs
faqSchema.statics.findActive = function(category) {
  const filter = { isActive: true };
  if (category) {
    filter.category = category;
  }
  return this.find(filter).sort({ order: 1, createdAt: 1 });
};

// Static method to search FAQs
faqSchema.statics.search = function(query) {
  return this.find({
    isActive: true,
    $text: { $search: query }
  }).sort({ score: { $meta: 'textScore' } });
};

// Instance method to increment views
faqSchema.methods.incrementViews = function() {
  this.meta.views += 1;
  return this.save();
};

// Instance method to mark as helpful
faqSchema.methods.markHelpful = function() {
  this.meta.helpful += 1;
  return this.save();
};

// Instance method to mark as not helpful
faqSchema.methods.markNotHelpful = function() {
  this.meta.notHelpful += 1;
  return this.save();
};

const FAQ = mongoose.model('FAQ', faqSchema);

export default FAQ;
