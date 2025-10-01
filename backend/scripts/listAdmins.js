import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function listAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const adminCollection = mongoose.connection.db.collection('admins');
    
    // Get all admins
    const admins = await adminCollection.find({}).toArray();

    admins.forEach((admin, index) => {
    });

  } catch (error) {
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the script
listAdmins();
