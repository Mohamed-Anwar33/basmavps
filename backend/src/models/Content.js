import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    enum: ['home', 'about', 'services', 'contact', 'faq', 'blog', 'how-to-order', 'policies']
  },
  key: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'textarea', 'rich', 'boolean', 'number', 'array', 'object'],
    default: 'text'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Compound index for page and key
contentSchema.index({ page: 1, key: 1 }, { unique: true });

const Content = mongoose.model('Content', contentSchema);

export default Content;
