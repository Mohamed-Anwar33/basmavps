import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../src/models/Order.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

/**
 * Migration script to update order statuses from old system to new system
 * 
 * Old system: ['pending', 'processing', 'paid', 'delivered', 'cancelled', 'refunded']
 * New system: 
 * - status: ['pending', 'in_progress', 'completed', 'delivered', 'cancelled']
 * - paymentStatus: ['pending', 'paid', 'failed', 'refunded']
 */

async function migrateOrderStatuses() {
  try {
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Get all orders
    const orders = await Order.find({});

    let migratedCount = 0;
    let errors = [];

    for (const order of orders) {
      try {
        let newStatus = order.status;
        let newPaymentStatus = order.paymentStatus || 'pending';

        // Handle old status mapping
        switch (order.status) {
          case 'paid':
            // If status was 'paid', it should be 'in_progress' with payment 'paid'
            newStatus = 'in_progress';
            newPaymentStatus = 'paid';
            break;
          
          case 'processing':
            // Processing becomes in_progress
            newStatus = 'in_progress';
            break;
            
          case 'refunded':
            // Refunded orders should be cancelled with payment refunded
            newStatus = 'cancelled';
            newPaymentStatus = 'refunded';
            break;
            
          case 'pending':
          case 'delivered':
          case 'cancelled':
            // These statuses remain the same
            newStatus = order.status;
            break;
            
          default:
        }

        // If paymentStatus doesn't exist, infer it from status
        if (!order.paymentStatus) {
          if (['in_progress', 'delivered'].includes(newStatus)) {
            newPaymentStatus = 'paid';
          } else if (newStatus === 'cancelled') {
            newPaymentStatus = 'failed';
          } else {
            newPaymentStatus = 'pending';
          }
        }

        // Update the order
        await Order.findByIdAndUpdate(order._id, {
          status: newStatus,
          paymentStatus: newPaymentStatus
        });

        migratedCount++;

      } catch (orderError) {
        errors.push({ orderNumber: order.orderNumber, error: orderError.message });
      }
    }


    if (errors.length > 0) {
      errors.forEach(error => {
      });
    }

    // Verify migration by checking updated orders
    const statusStats = await Order.aggregate([
      {
        $group: {
          _id: { status: '$status', paymentStatus: '$paymentStatus' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.status': 1, '_id.paymentStatus': 1 }
      }
    ]);

    statusStats.forEach(stat => {
    });


  } catch (error) {
  } finally {
    await mongoose.disconnect();
  }
}

// Run migration if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateOrderStatuses().catch(console.error);
}

export default migrateOrderStatuses;
