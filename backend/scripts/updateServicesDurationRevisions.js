import mongoose from 'mongoose';
import Service from '../src/models/Service.js';
import dotenv from 'dotenv';

dotenv.config();

// Default values for different service categories
const categoryDefaults = {
  'social-media': { deliveryTime: { min: 1, max: 4 }, revisions: 2 },
  'banners': { deliveryTime: { min: 1, max: 3 }, revisions: 2 },
  'content': { deliveryTime: { min: 2, max: 5 }, revisions: 3 },
  'resumes': { deliveryTime: { min: 1, max: 2 }, revisions: 1 },
  'cv-templates': { deliveryTime: { min: 0, max: 1 }, revisions: 0 }, // Digital delivery
  'logos': { deliveryTime: { min: 2, max: 7 }, revisions: 3 },
  'linkedin': { deliveryTime: { min: 1, max: 6 }, revisions: 2 },
  'consultation': { deliveryTime: { min: 1, max: 1 }, revisions: 0 },
  'management': { deliveryTime: { min: 3, max: 10 }, revisions: 2 },
  'branding': { deliveryTime: { min: 5, max: 14 }, revisions: 3 },
  'web-design': { deliveryTime: { min: 7, max: 21 }, revisions: 3 },
  'print-design': { deliveryTime: { min: 2, max: 7 }, revisions: 2 },
  'marketing': { deliveryTime: { min: 3, max: 7 }, revisions: 2 }
};

async function updateServicesDurationRevisions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const services = await Service.find({});

    let updatedCount = 0;

    for (const service of services) {
      let needsUpdate = false;
      const updates = {};

      // Check if deliveryTime is missing or invalid
      if (!service.deliveryTime || 
          typeof service.deliveryTime.min !== 'number' || 
          typeof service.deliveryTime.max !== 'number') {
        
        const categoryDefault = categoryDefaults[service.category] || categoryDefaults['social-media'];
        updates.deliveryTime = categoryDefault.deliveryTime;
        needsUpdate = true;
      }

      // Check if revisions is missing or invalid
      if (typeof service.revisions !== 'number') {
        const categoryDefault = categoryDefaults[service.category] || categoryDefaults['social-media'];
        updates.revisions = categoryDefault.revisions;
        needsUpdate = true;
      }

      // Update service if needed
      if (needsUpdate) {
        await Service.findByIdAndUpdate(service._id, updates);
        updatedCount++;
      } else {
      }
    }

    
    // Display summary of all services
    const updatedServices = await Service.find({}).sort({ order: 1, createdAt: 1 });
    updatedServices.forEach((service, index) => {
    });

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

updateServicesDurationRevisions();
