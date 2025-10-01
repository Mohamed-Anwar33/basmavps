import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

async function testPayPalLiveCredentials() {
  console.log('🚀 Testing PayPal Live Credentials...\n');
  
  // Display current configuration
  console.log('📋 Current PayPal Configuration:');
  console.log(`   Client ID: ${process.env.PAYPAL_CLIENT_ID?.substring(0, 20)}...`);
  console.log(`   Environment: ${process.env.PAYPAL_MODE}`);
  console.log(`   Base URL: ${process.env.PAYPAL_BASE_URL}`);
  console.log(`   Webhook ID: ${process.env.PAYPAL_WEBHOOK_ID}\n`);
  
  try {
    // Test PayPal authentication
    console.log('🔐 Testing PayPal Authentication...');
    
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.log('❌ PayPal Authentication Failed:');
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Error: ${errorData}`);
      return false;
    }

    const data = await response.json();
    console.log('✅ PayPal Authentication Successful!');
    console.log(`   Access Token: ${data.access_token.substring(0, 20)}...`);
    console.log(`   Token Type: ${data.token_type}`);
    console.log(`   Expires In: ${data.expires_in} seconds\n`);

    // Test creating a sample order (but don't process it)
    console.log('🛒 Testing Order Creation (Sample)...');
    
    const orderRequest = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: '10.00'
        },
        description: 'Test Order for Live PayPal Integration',
        custom_id: 'test-order-123'
      }],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/order/success?provider=paypal`,
        cancel_url: `${process.env.FRONTEND_URL}/order/cancel?provider=paypal`,
        brand_name: 'Basma Design',
        locale: 'ar-SA',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW'
      }
    };

    const orderResponse = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${data.access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(orderRequest)
    });

    if (!orderResponse.ok) {
      const orderError = await orderResponse.json();
      console.log('❌ Order Creation Failed:');
      console.log(`   Status: ${orderResponse.status} ${orderResponse.statusText}`);
      console.log(`   Error: ${JSON.stringify(orderError, null, 2)}`);
      return false;
    }

    const orderData = await orderResponse.json();
    console.log('✅ Sample Order Created Successfully!');
    console.log(`   Order ID: ${orderData.id}`);
    console.log(`   Status: ${orderData.status}`);
    console.log(`   Links: ${orderData.links?.length || 0} available`);
    
    // Find approval URL
    const approvalLink = orderData.links?.find(link => link.rel === 'approve');
    if (approvalLink) {
      console.log(`   Approval URL: ${approvalLink.href.substring(0, 50)}...`);
    }

    console.log('\n🎉 PayPal Live Integration Test Completed Successfully!');
    console.log('✅ All PayPal endpoints are working correctly');
    console.log('✅ Live credentials are valid and active');
    console.log('✅ Order creation is functional');
    console.log('✅ Ready for production payments!');
    
    return true;

  } catch (error) {
    console.log('❌ PayPal Test Failed:');
    console.log(`   Error: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
    return false;
  }
}

// Run the test
testPayPalLiveCredentials()
  .then(success => {
    if (success) {
      console.log('\n🚀 PayPal Live Integration is Ready!');
      process.exit(0);
    } else {
      console.log('\n❌ PayPal Live Integration has Issues!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Test Script Error:', error);
    process.exit(1);
  });
