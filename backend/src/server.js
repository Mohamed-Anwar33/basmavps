// Production-ready server start

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables first, before any other imports
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

// Debug environment variables
import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Import WebSocket server
import websocketServer from './utils/websocketServer.js';

// Import Email Guarantee System
import { startEmailGuard } from './middleware/emailGuarantee.js';
import { startAutoEmailMonitoring } from './middleware/autoEmailSender.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { 
  generalLimiter, 
  authLimiter,
  securityHeaders, 
  corsOptions, 
  preventHPP, 
  preventNoSQLInjection,
  requestLogger 
} from './middleware/security.js';
import { sanitizeBody, sanitizeQuery } from './middleware/sanitization.js';

// Import production security config
import productionConfig from './config/production.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import serviceRoutes from './routes/services.js';
import blogRoutes from './routes/blogs.js';
import faqRoutes from './routes/faqs.js';
import contactRoutes from './routes/contact.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import uploadRoutes from './routes/uploads.js';
import adminRoutes from './routes/admin/index.js';
import settingsRoutes from './routes/settings.js';
import contentRoutes from './routes/content.js';
import homepageSectionRoutes from './routes/homepageSection.js';
import healthRoutes from './routes/health.js';
import realtimeSyncRoutes from './routes/admin/realtimeSync.js';
import checkoutRoutes from './routes/checkout.js';
import contactPageRoutes from './routes/contactPage.js';
import bannerRoutes from './routes/banners.js';
import paypalWebhookRoutes from './routes/paypalWebhook.js';
import cleanupRoutes from './routes/cleanup.js';
import teamRoutes from './routes/team.js';

// 🧹 استيراد مجدولة التنظيف
import CleanupScheduler from './jobs/cleanupScheduler.js';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// 🧹 بدء مجدولة التنظيف التلقائية
if (process.env.NODE_ENV !== 'test') {
  CleanupScheduler.start();
}

// Enhanced security middleware for production
if (process.env.NODE_ENV === 'production') {
  app.use(productionConfig.securityHeaders);
  app.use(helmet(productionConfig.helmetConfig));
  app.use(cors(productionConfig.corsConfig));
  app.use(productionConfig.sanitizeRequest);
  app.use(productionConfig.securityLogger);
  app.use(productionConfig.rateLimitConfig.general);
} else {
  // Development security middleware
  app.use(securityHeaders);
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  app.use(cors(corsOptions));
  app.use(generalLimiter);
}

// Request logging
app.use(requestLogger);

// Prevent attacks
app.use(preventHPP);
app.use(preventNoSQLInjection);

// Input sanitization
app.use(sanitizeQuery());
app.use(sanitizeBody({ allowHTML: true }));

// Body parsing middleware with UTF-8 encoding
app.use(express.json({ limit: '10mb', type: 'application/json', charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set default charset for all responses
app.use((req, res, next) => {
  res.charset = 'utf-8';
  res.set('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Basma Design API',
      version: '1.0.0',
      description: 'Production-ready backend API for Basma Design website',
      contact: {
        name: 'Basma Design',
        email: 'admin@basmadesign.com'
      }
    },
    servers: [
      {
        url: process.env.BACKEND_URL || 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/routes/admin/*.js', './src/models/*.js']
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Enhanced rate limiting for specific endpoints in production
if (process.env.NODE_ENV === 'production') {
  app.use('/api/auth', productionConfig.rateLimitConfig.auth);
  app.use('/api/payment', productionConfig.rateLimitConfig.payment);
  app.use('/api/contact', productionConfig.rateLimitConfig.contact);
  app.use('/api/admin', productionConfig.rateLimitConfig.admin);
  app.use('/api/checkout', productionConfig.rateLimitConfig.checkout);
}

// 🔥 SIMPLE & CLEAN: Order Status Update Route
import { updateOrderStatusSimple, getOrderDetailsSimple } from './controllers/simpleOrderStatusController.js';
import { adminAuth as fixAdminAuth } from './middleware/adminAuth.js';
app.put('/api/admin/orders/:id/status', fixAdminAuth, updateOrderStatusSimple);
app.get('/api/admin/orders/:id/details', fixAdminAuth, getOrderDetailsSimple);

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/blogs', blogRoutes); // alias to support plural path used by frontend
app.use('/api/faq', faqRoutes);
app.use('/api/faqs', faqRoutes); // alias to support plural path used by frontend
app.use('/api/contact', contactRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/cleanup', cleanupRoutes); // 🧹 مسارات التنظيف
app.use('/api/settings', settingsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/webhooks', paypalWebhookRoutes);

// Import and use update policies route
import updatePoliciesRoute from './routes/updatePolicies.js';
app.use('/api', updatePoliciesRoute);
app.use('/api/homepage-sections', homepageSectionRoutes);
app.use('/api/contact-page', contactPageRoutes);
app.use('/api/admin/sync', realtimeSyncRoutes);

// Individual routes for compatibility
import { getBanners } from './controllers/settingsController.js';
import { getHeroSection, getCounters } from './controllers/homepageController.js';
import { getHeroSection as getHeroSectionData, updateHeroSection } from './controllers/heroSectionController.js';
import { getFoundationalStatement, updateFoundationalStatement } from './controllers/foundationalController.js';
import { updateOrderStatus } from './controllers/orderAdminController.js';
import { adminAuth } from './middleware/auth.js';

app.get('/api/banners', getBanners);
app.get('/api/hero-section', getHeroSectionData);
app.get('/api/foundational', getFoundationalStatement);
app.get('/api/counters', getCounters);

// Order status route moved to top for priority

// Profile endpoint (authenticated)
app.get('/api/profile', async (req, res) => {
  try {
    // This will be implemented in the auth middleware
    res.json({ message: 'Profile endpoint - to be implemented' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error logging middleware
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.message);
  console.error('📍 Stack:', err.stack);
  next(err);
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    if (process.env.NODE_ENV !== 'production') {
    }
  } catch (error) {
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  
  // Initialize WebSocket server
  websocketServer.initialize(server);
  
  server.listen(PORT, () => {
    if (process.env.NODE_ENV !== 'production') {
    }
    
    // Start Email Systems
    startEmailGuard();
    startAutoEmailMonitoring();
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    server.close(() => {
      mongoose.connection.close();
    });
  });

  return server;
};

// Only start server if this file is run directly
if (process.env.NODE_ENV !== 'test') {
  startServer().catch(console.error);
}

export default app;

