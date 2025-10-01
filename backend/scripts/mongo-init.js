// MongoDB initialization script for Docker
db = db.getSiblingDB('basma_db');

// Create collections
db.createCollection('users');
db.createCollection('services');
db.createCollection('blogs');
db.createCollection('faqs');
db.createCollection('orders');
db.createCollection('payments');
db.createCollection('contacts');
db.createCollection('media');
db.createCollection('settings');
db.createCollection('auditlogs');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isEmailVerified: 1 });

db.services.createIndex({ slug: 1 }, { unique: true });
db.services.createIndex({ status: 1 });
db.services.createIndex({ featured: 1 });
db.services.createIndex({ category: 1 });
db.services.createIndex({ 'title.ar': 'text', 'title.en': 'text', 'description.ar': 'text', 'description.en': 'text' });

db.blogs.createIndex({ slug: 1 }, { unique: true });
db.blogs.createIndex({ status: 1 });
db.blogs.createIndex({ featured: 1 });
db.blogs.createIndex({ author: 1 });
db.blogs.createIndex({ tags: 1 });
db.blogs.createIndex({ 'title.ar': 'text', 'title.en': 'text', 'content.ar': 'text', 'content.en': 'text' });

db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ userId: 1 });
db.orders.createIndex({ 'guestInfo.email': 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });

db.payments.createIndex({ orderId: 1 });
db.payments.createIndex({ status: 1 });
db.payments.createIndex({ provider: 1 });
db.payments.createIndex({ 'providerData.sessionId': 1 });

db.contacts.createIndex({ email: 1 });
db.contacts.createIndex({ status: 1 });
db.contacts.createIndex({ priority: 1 });
db.contacts.createIndex({ createdAt: -1 });

db.media.createIndex({ uploaderId: 1 });
db.media.createIndex({ mimeType: 1 });
db.media.createIndex({ 'meta.folder': 1 });
db.media.createIndex({ isPublic: 1 });

db.settings.createIndex({ category: 1, key: 1 }, { unique: true });

db.auditlogs.createIndex({ userId: 1 });
db.auditlogs.createIndex({ action: 1 });
db.auditlogs.createIndex({ resourceType: 1 });
db.auditlogs.createIndex({ createdAt: -1 });

print('Database initialized successfully with indexes');
