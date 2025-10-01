import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file path and load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

// PayPal Environment Configuration
const environment = process.env.PAYPAL_MODE === 'live' ? 'production' : 'sandbox';
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const baseURL = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';

// Debug credentials loading
// Initialize PayPal client lazily
let paypalClient = null;

const getPayPalClient = () => {
  if (!paypalClient) {

    if (!clientId || !clientSecret) {
      throw new Error('PayPal credentials not configured');
    }
    // Use simple HTTP requests instead of SDK for now
    paypalClient = {
      baseURL,
      clientId,
      clientSecret,
      environment
    };
  }
  return paypalClient;
};

/**
 * Get PayPal Access Token
 */
const getPayPalAccessToken = async () => {
  const client = getPayPalClient();
  const auth = Buffer.from(`${client.clientId}:${client.clientSecret}`).toString('base64');
  
  const response = await fetch(`${client.baseURL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error(`PayPal authentication failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
};

/**
 * Create PayPal Order
 */
export const createPayPalOrder = async (orderData) => {
  try {
    const client = getPayPalClient();
    const accessToken = await getPayPalAccessToken();
    
    const request = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: orderData.currency === 'SAR' ? 'USD' : orderData.currency,
          value: orderData.currency === 'SAR' ? (orderData.total / 3.75).toFixed(2) : orderData.total.toFixed(2)
        },
        description: `Order ${orderData.orderNumber}`,
        custom_id: orderData._id.toString()
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

    const response = await fetch(`${client.baseURL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`PayPal API Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      status: data.status,
      links: data.links
    };
  } catch (error) {
    throw new Error(`PayPal order creation failed: ${error.message}`);
  }
};

/**
 * Capture PayPal Order
 */
export const capturePayPalOrder = async (orderId) => {
  try {
    const client = getPayPalClient();
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${client.baseURL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`PayPal API Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      status: data.status,
      captureId: data.purchase_units[0]?.payments?.captures?.[0]?.id,
      payer: data.payer,
      amount: data.purchase_units[0]?.payments?.captures?.[0]?.amount
    };
  } catch (error) {
    throw new Error(`PayPal order capture failed: ${error.message}`);
  }
};

/**
 * Get PayPal Order Details
 */
export const getPayPalOrderDetails = async (orderId) => {
  try {
    const client = getPayPalClient();
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${client.baseURL}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`PayPal API Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      status: data.status,
      intent: data.intent,
      payer: data.payer,
      purchase_units: data.purchase_units
    };
  } catch (error) {
    throw new Error(`PayPal order retrieval failed: ${error.message}`);
  }
};

/**
 * Verify PayPal Webhook Signature
 */
export const verifyPayPalWebhook = async (headers, body, webhookId) => {
  try {
    // PayPal webhook verification would go here
    // For now, we'll implement basic verification
    const authAlgo = headers['paypal-auth-algo'];
    const transmission_id = headers['paypal-transmission-id'];
    const cert_id = headers['paypal-cert-id'];
    const transmission_sig = headers['paypal-transmission-sig'];
    const transmission_time = headers['paypal-transmission-time'];

    if (!authAlgo || !transmission_id || !cert_id || !transmission_sig || !transmission_time) {
      throw new Error('Missing required PayPal headers');
    }

    // In production, implement proper webhook signature verification
    // using PayPal's webhook verification API
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrderDetails,
  verifyPayPalWebhook
};

