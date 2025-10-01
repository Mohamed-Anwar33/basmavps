import mongoose from 'mongoose';
import PageContent from '../src/models/PageContent.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function deleteDefaultHowToOrder() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Find existing howToOrder page
    const existingPage = await PageContent.findOne({ pageType: 'howToOrder' });
    
    if (existingPage) {
      
      // Delete the existing page
      await PageContent.deleteOne({ pageType: 'howToOrder' });
    } else {
    }

    
  } catch (error) {
  } finally {
    await mongoose.disconnect();
  }
}

deleteDefaultHowToOrder();
