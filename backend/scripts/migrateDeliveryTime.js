import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from '../src/models/Service.js';

dotenv.config();

const migrateDeliveryTime = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Get all services
    const services = await Service.find({});

    for (const service of services) {
      // Convert durationDays to deliveryTime based on service type
      let deliveryTime = { min: 1, max: 4 }; // default

      // Set specific delivery times based on service slug or category
      if (service.slug.includes('cv-template') || service.slug.includes('resume-template')) {
        deliveryTime = { min: 0, max: 1 }; // Instant delivery for templates
      } else if (service.slug.includes('consultation') || service.slug.includes('consulting')) {
        deliveryTime = { min: 1, max: 2 }; // Quick consultation
      } else if (service.slug.includes('package') || service.slug.includes('10-designs') || service.slug.includes('linkedin-complete')) {
        deliveryTime = { min: 5, max: 7 }; // Longer for complex packages
      } else if (service.slug.includes('carousel') || service.slug.includes('management')) {
        deliveryTime = { min: 3, max: 5 }; // Medium complexity
      } else if (service.slug.includes('content') || service.slug.includes('article')) {
        deliveryTime = { min: 2, max: 3 }; // Content writing
      } else if (service.slug.includes('logo') || service.slug.includes('branding')) {
        deliveryTime = { min: 3, max: 5 }; // Logo design
      } else {
        // Default for posts, banners, etc.
        deliveryTime = { min: 1, max: 4 };
      }

      // Update the service
      await Service.updateOne(
        { _id: service._id },
        { 
          $set: { 
            deliveryTime: deliveryTime,
            revisions: service.revisions || 2,
            nonRefundable: true,
            deliveryFormats: ['PDF', 'PNG', 'JPG']
          }
        }
      );

    }

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

migrateDeliveryTime();
