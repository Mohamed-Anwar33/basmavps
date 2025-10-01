import mongoose from 'mongoose';
import Order from '../src/models/Order.js';
import Payment from '../src/models/Payment.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Fix Order-Payment References
 * يصلح الربط بين الطلبات والدفعات في قاعدة البيانات
 */

const fixOrderPaymentReferences = async () => {
  try {

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/basma-design');

    // Find all orders that have paymentId as string but should be ObjectId
    const orders = await Order.find({
      paymentId: { $exists: true, $ne: null }
    });


    let fixedCount = 0;
    let errorCount = 0;

    for (const order of orders) {
      try {
        // If paymentId is already ObjectId, skip
        if (mongoose.Types.ObjectId.isValid(order.paymentId) && 
            order.paymentId.toString().length === 24) {
          continue;
        }

        // Try to find payment by providerPaymentId (if paymentId was stored as string)
        let payment = null;
        
        // First, try to find by _id if it's a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(order.paymentId)) {
          payment = await Payment.findById(order.paymentId);
        }
        
        // If not found, try to find by orderId
        if (!payment) {
          payment = await Payment.findOne({ orderId: order._id });
        }

        if (payment) {
          // Update order with correct payment ObjectId reference
          order.paymentId = payment._id;
          
          // Ensure payment status is synced
          if (payment.status === 'succeeded' && order.paymentStatus !== 'paid') {
            order.paymentStatus = 'paid';
            order.status = 'paid';
          }
          
          await order.save();
          fixedCount++;
        } else {
          // Clear invalid paymentId
          order.paymentId = null;
          await order.save();
        }

      } catch (error) {
        errorCount++;
      }
    }

    // Verify the fixes
    const verifyOrders = await Order.find({
      paymentId: { $exists: true, $ne: null }
    }).populate('paymentId');

    let verifiedCount = 0;
    for (const order of verifyOrders) {
      if (order.paymentId && typeof order.paymentId === 'object' && order.paymentId._id) {
        verifiedCount++;
      }
    }



  } catch (error) {
  } finally {
    await mongoose.disconnect();
  }
};

// Run the script
fixOrderPaymentReferences()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });

export default fixOrderPaymentReferences;
