import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const updateOriginalPrices = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/basma-design');

    const Service = mongoose.model('Service', new mongoose.Schema({}, {strict: false}));

    // Update some services with original prices to show discount
    const updates = [
      {
        slug: 'social-media-management',
        originalPrice: { SAR: 1250, USD: 333 }
      },
      {
        slug: 'business-development-consultation',
        originalPrice: { SAR: 1875, USD: 500 }
      },
      {
        slug: 'logo-design',
        originalPrice: { SAR: 750, USD: 200 }
      }
    ];

    for (const update of updates) {
      await Service.updateOne(
        { slug: update.slug },
        { $set: { originalPrice: update.originalPrice } }
      );
    }

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

updateOriginalPrices();
