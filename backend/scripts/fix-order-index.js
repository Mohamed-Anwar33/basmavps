import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixOrderIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const db = mongoose.connection.db;
    const collection = db.collection('orders');

    const indexes = await collection.indexes();

    // Drop the unique index on orderNumber if it exists
    try {
      await collection.dropIndex('orderNumber_1');
    } catch (error) {
      if (error.code === 27 || error.message.includes('index not found')) {
      } else {
      }
    }

    // Create new sparse index
    try {
      await collection.createIndex({ orderNumber: 1 }, { sparse: true, name: 'orderNumber_sparse_1' });
    } catch (error) {
    }

    // Clean up orders with null orderNumber that might be causing issues
    const result = await collection.deleteMany({ 
      orderNumber: null, 
      paymentStatus: 'pending',
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Older than 24 hours
    });

    const finalIndexes = await collection.indexes();

    
  } catch (error) {
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixOrderIndex();
