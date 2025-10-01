import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Banner from '../src/models/Banner.js';

dotenv.config();

async function clearAllBanners() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Delete all banners
    const result = await Banner.deleteMany({});

  } catch (error) {
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
  }
}

// Run the script
clearAllBanners();
