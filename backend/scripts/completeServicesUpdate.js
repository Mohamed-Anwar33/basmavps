import mongoose from 'mongoose';
import Service from '../src/models/Service.js';
import dotenv from 'dotenv';

dotenv.config();

// Import complete services data
import { servicesData } from './servicesData.js';
import { allServicesData } from './allServicesData.js';

// Combine all services
const completeServicesData = [...servicesData, ...allServicesData];

async function updateServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing services
    await Service.deleteMany({});

    // Insert new services in batches
    const batchSize = 5;
    for (let i = 0; i < completeServicesData.length; i += batchSize) {
      const batch = completeServicesData.slice(i, i + batchSize);
      await Service.insertMany(batch);
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}`);
    }

  } catch (error) {
  } finally {
    await mongoose.disconnect();
  }
}

updateServices();
