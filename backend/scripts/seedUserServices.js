import mongoose from 'mongoose';
import dotenv from 'dotenv';
import slugify from 'slugify';
import Service from '../src/models/Service.js';
import { servicesData as primaryServices } from './servicesData.js';
import { allServicesData as additionalServices } from './allServicesData.js';

dotenv.config();

// Category defaults for delivery time and revisions
const categoryDefaults = {
  'social-media': { deliveryTime: { min: 1, max: 4 }, revisions: 2 },
  'banners': { deliveryTime: { min: 1, max: 4 }, revisions: 2 },
  'content': { deliveryTime: { min: 1, max: 5 }, revisions: 2 },
  'resumes': { deliveryTime: { min: 1, max: 4 }, revisions: 2 },
  'cv-templates': { deliveryTime: { min: 0, max: 1 }, revisions: 0 },
  'logos': { deliveryTime: { min: 3, max: 8 }, revisions: 2 },
  'linkedin': { deliveryTime: { min: 1, max: 6 }, revisions: 2 },
  'consultation': { deliveryTime: { min: 1, max: 2 }, revisions: 0 },
  'management': { deliveryTime: { min: 7, max: 30 }, revisions: 2 },
  'branding': { deliveryTime: { min: 5, max: 14 }, revisions: 3 },
  'web-design': { deliveryTime: { min: 7, max: 21 }, revisions: 3 },
  'print-design': { deliveryTime: { min: 2, max: 7 }, revisions: 2 },
  'marketing': { deliveryTime: { min: 3, max: 7 }, revisions: 2 }
};

function ensureSlug(item) {
  if (item.slug && typeof item.slug === 'string') return item.slug.toLowerCase();
  const base = item?.title?.en || item?.title?.ar || 'service';
  return slugify(base, { lower: true, strict: true });
}

function normalizePrice(item) {
  // Prefer SAR as primary; ensure USD exists too
  const p = item.price || {};
  let SAR = typeof p.SAR === 'number' ? p.SAR : undefined;
  let USD = typeof p.USD === 'number' ? p.USD : undefined;

  // If only one exists, compute the other using 1 USD = 3.75 SAR
  const rate = 3.75;
  if (SAR == null && USD != null) SAR = Math.round((USD * rate) * 100) / 100;
  if (USD == null && SAR != null) USD = Math.round((SAR / rate) * 100) / 100;

  // Fallback to 0 if still missing
  SAR = SAR != null ? SAR : 0;
  USD = USD != null ? USD : 0;

  // Handle original price (discount) if present
  const original = item.originalPrice || {};
  let originalSAR = typeof original.SAR === 'number' ? original.SAR : undefined;
  let originalUSD = typeof original.USD === 'number' ? original.USD : undefined;

  if (originalSAR == null && originalUSD != null) originalSAR = Math.round((originalUSD * rate) * 100) / 100;
  if (originalUSD == null && originalSAR != null) originalUSD = Math.round((originalSAR / rate) * 100) / 100;

  const price = { SAR, USD };
  const originalPrice = (originalSAR != null || originalUSD != null) ? { SAR: originalSAR ?? 0, USD: originalUSD ?? 0 } : undefined;

  return { price, originalPrice };
}

function pickDelivery(item) {
  if (item.deliveryTime && typeof item.deliveryTime.min === 'number' && typeof item.deliveryTime.max === 'number') {
    return { ...item.deliveryTime };
  }
  const cat = item.category || 'social-media';
  const def = categoryDefaults[cat] || categoryDefaults['social-media'];
  return { ...def.deliveryTime };
}

function pickRevisions(item) {
  if (typeof item.revisions === 'number') return item.revisions;
  const cat = item.category || 'social-media';
  const def = categoryDefaults[cat] || categoryDefaults['social-media'];
  return def.revisions;
}

function normalizeFeatures(item) {
  // Ensure features object with ar/en arrays of strings
  const features = item.features || {};
  const ar = Array.isArray(features.ar) ? features.ar.map(String) : [];
  const en = Array.isArray(features.en) ? features.en.map(String) : [];
  return { ar, en };
}

function normalizeDescriptions(item) {
  // Ensure price is NOT embedded in description (strip lines that start with bullets mentioning price if any)
  const clean = (txt) => {
    if (!txt || typeof txt !== 'string') return '';
    return txt
      .split('\n')
      .filter(line => !/^(\s*[•\-\u2022\u00B7\.]\s*)?\s*السعر/i.test(line))
      .join('\n')
      .trim();
  };
  return {
    ar: clean(item?.description?.ar),
    en: clean(item?.description?.en)
  };
}

function normalizeDeliveryFormats(item) {
  if (Array.isArray(item.deliveryFormats) && item.deliveryFormats.length > 0) return item.deliveryFormats;
  // Simple defaults by category
  const cat = item.category;
  if (cat === 'content') return ['Word', 'PDF'];
  if (cat === 'cv-templates') return ['Canva Link'];
  return ['PNG', 'PDF', 'ZIP'];
}

function normalizeImages(item) {
  if (Array.isArray(item.images)) return item.images;
  return [];
}

function normalizeOne(raw, orderIndex) {
  const slug = ensureSlug(raw);
  const { price, originalPrice } = normalizePrice(raw);
  const deliveryTime = pickDelivery(raw);
  const revisions = pickRevisions(raw);
  const description = normalizeDescriptions(raw);
  const features = normalizeFeatures(raw);
  const images = normalizeImages(raw);
  const deliveryFormats = normalizeDeliveryFormats(raw);
  const nonRefundable = raw.nonRefundable !== undefined ? !!raw.nonRefundable : true;
  const isActive = raw.isActive !== undefined ? !!raw.isActive : true;
  const isFeatured = raw.isFeatured !== undefined ? !!raw.isFeatured : false;
  const order = typeof raw.order === 'number' ? raw.order : orderIndex + 1;

  return {
    title: raw.title,
    slug,
    description,
    price,
    ...(originalPrice ? { originalPrice } : {}),
    deliveryTime,
    // Keep legacy durationDays aligned for any legacy consumers
    durationDays: deliveryTime.max,
    revisions,
    deliveryFormats,
    nonRefundable,
    category: raw.category,
    images,
    features,
    // For digital products like cv-templates, do NOT expose public links
    deliveryLinks: (raw.category === 'cv-templates') ? [] : (Array.isArray(raw.deliveryLinks) ? raw.deliveryLinks : []),
    isActive,
    isFeatured,
    order,
    // Optional UI texts if present
    ...(raw.uiTexts ? { uiTexts: raw.uiTexts } : {})
  };
}

async function seed() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/basma_db';
    await mongoose.connect(uri);

    // Merge and de-duplicate by slug (primaryServices first, then additional)
    const merged = [...primaryServices, ...additionalServices];

    // Build unique map by slug
    const bySlug = new Map();
    let index = 0;
    for (const item of merged) {
      const normalized = normalizeOne(item, index++);
      if (!normalized.slug) continue;
      bySlug.set(normalized.slug, normalized);
    }

    const toUpsert = Array.from(bySlug.values());

    let created = 0;
    let updated = 0;

    for (const svc of toUpsert) {
      const result = await Service.findOneAndUpdate(
        { slug: svc.slug },
        { $set: svc },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (result) {
        // Distinguish create vs update by checking createdAt vs updatedAt after save would require another query.
        // Simple heuristic: try to find before updating (costly). Instead, attempt an updateFirst and check matchedCount - skipped for simplicity.
        // We'll log as upserted.
      }
    }


    // Optional: summary output
    const count = await Service.countDocuments();
  } catch (err) {
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Ensure the script runs when executed directly across platforms (Windows/Unix)
const isDirectRun = (() => {
  try {
    const argvPath = (process.argv[1] || '').replace(/\\/g, '/');
    const urlPath = new URL(import.meta.url).pathname.replace(/\\/g, '/');
    const fileName = argvPath.split('/').pop()?.toLowerCase() || '';
    return (
      fileName === 'seeduserservices.js' ||
      argvPath === urlPath ||
      `file://${argvPath}` === import.meta.url
    );
  } catch (_) {
    return false;
  }
})();

if (isDirectRun) {
  seed();
}

export default seed;
