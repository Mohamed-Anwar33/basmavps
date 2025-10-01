import mongoose from 'mongoose';
import Order from '../src/models/Order.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const updateOrdersPaymentStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    
    // Find all orders that don't have paymentStatus set
    const ordersToUpdate = await Order.find({
      $or: [
        { paymentStatus: { $exists: false } },
        { paymentStatus: null }
      ]
    });


    let updatedCount = 0;
    
    for (const order of ordersToUpdate) {
      let paymentStatus = 'pending';
      
      // Map status to paymentStatus
      switch(order.status) {
        case 'paid':
        case 'delivered':
          paymentStatus = 'paid';
          break;
        case 'refunded':
          paymentStatus = 'refunded';
          break;
        case 'cancelled':
          paymentStatus = 'failed';
          break;
        default:
          paymentStatus = 'pending';
      }

      // Update the order
      await Order.findByIdAndUpdate(order._id, {
        paymentStatus: paymentStatus
      });

      updatedCount++;
    }

    
    // Verify the update
    const verifyCount = await Order.countDocuments({ paymentStatus: { $exists: true } });
    const totalCount = await Order.countDocuments();
    

  } catch (error) {
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run the script
updateOrdersPaymentStatus();
