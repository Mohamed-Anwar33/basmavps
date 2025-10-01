import cacheManager, { CacheKeys } from '../utils/cacheManager.js';

/**
 * Cache middleware for Express routes
 * Provides automatic caching and cache invalidation
 */

/**
 * Cache response middleware
 */
export const cacheResponse = (options = {}) => {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator = null,
    condition = null,
    skipCache = false
  } = options;

  return async (req, res, next) => {
    if (skipCache || req.method !== 'GET') {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator 
        ? keyGenerator(req) 
        : `${req.originalUrl}:${JSON.stringify(req.query)}`;

      // Check condition if provided
      if (condition && !condition(req)) {
        return next();
      }

      // Try to get from cache
      const cachedResponse = await cacheManager.get(cacheKey);
      if (cachedResponse) {
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        return res.json(cachedResponse);
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache response
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheManager.set(cacheKey, data, ttl).catch(err => {
            });
        }
        
        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Key', cacheKey);
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      next();
    }
  };
};

/**
 * Cache invalidation middleware
 */
export const invalidateCache = (patterns = []) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;

    // Override json method to invalidate cache after successful response
    res.json = function(data) {
      const result = originalJson.call(this, data);
      
      // Only invalidate on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Invalidate cache patterns asynchronously
        Promise.all(
          patterns.map(pattern => {
            if (typeof pattern === 'function') {
              return cacheManager.delPattern(pattern(req, data));
            }
            return cacheManager.delPattern(pattern);
          })
        ).catch(err => {
          });
      }
      
      return result;
    };

    next();
  };
};

/**
 * Specific cache middleware for content routes
 */
export const cachePageContent = cacheResponse({
  ttl: 600, // 10 minutes for page content
  keyGenerator: (req) => {
    const { pageType } = req.params;
    const { includeVersions, includeValidation } = req.query;
    return CacheKeys.PAGE_CONTENT(pageType) + 
           (includeVersions ? ':versions' : '') + 
           (includeValidation ? ':validation' : '');
  },
  condition: (req) => !req.query.includeVersions // Don't cache when including versions
});

export const cachePageContentList = cacheResponse({
  ttl: 300, // 5 minutes for content lists
  keyGenerator: (req) => CacheKeys.PAGE_CONTENT_LIST(req.query)
});

export const cacheHomepageSections = cacheResponse({
  ttl: 600, // 10 minutes for homepage sections
  keyGenerator: () => CacheKeys.HOMEPAGE_SECTIONS()
});

export const cacheHomepageSection = cacheResponse({
  ttl: 600, // 10 minutes for individual sections
  keyGenerator: (req) => CacheKeys.HOMEPAGE_SECTION(req.params.sectionType)
});

export const cacheContentSummary = cacheResponse({
  ttl: 180, // 3 minutes for summary (more dynamic)
  keyGenerator: () => CacheKeys.CONTENT_SUMMARY()
});

export const cacheMediaList = cacheResponse({
  ttl: 300, // 5 minutes for media lists
  keyGenerator: (req) => CacheKeys.MEDIA_LIST(req.query)
});

/**
 * Cache invalidation patterns for content updates
 */
export const invalidatePageContent = invalidateCache([
  (req) => CacheKeys.PAGE_CONTENT(req.params.pageType),
  'pages:list:*',
  CacheKeys.CONTENT_SUMMARY()
]);

export const invalidateHomepageSections = invalidateCache([
  'homepage:*',
  CacheKeys.CONTENT_SUMMARY()
]);

export const invalidateMedia = invalidateCache([
  'media:*'
]);

export const invalidateAllContent = invalidateCache([
  'page:*',
  'pages:*',
  'homepage:*',
  'content:*',
  'media:*'
]);

/**
 * Conditional cache middleware based on user role
 */
export const cacheForPublic = (options = {}) => {
  return cacheResponse({
    ...options,
    condition: (req) => !req.admin && !req.user // Only cache for non-authenticated users
  });
};

/**
 * Cache warming middleware - preload frequently accessed content
 */
export const warmCache = async () => {
  try {
    // Import models here to avoid circular dependencies
    const PageContent = (await import('../models/PageContent.js')).default;
    const HomepageSection = (await import('../models/HomepageSection.js')).default;
    
    // Warm page content cache
    const pages = await PageContent.find({ isActive: true, status: 'published' });
    for (const page of pages) {
      await cacheManager.set(CacheKeys.PAGE_CONTENT(page.pageType), page, 600);
    }
    
    // Warm homepage sections cache
    const sections = await HomepageSection.find({ isActive: true }).sort({ order: 1 });
    await cacheManager.set(CacheKeys.HOMEPAGE_SECTIONS(), sections, 600);
    
    for (const section of sections) {
      await cacheManager.set(CacheKeys.HOMEPAGE_SECTION(section.sectionType), section, 600);
    }
    
    } catch (error) {
    }
};

/**
 * Cache health check middleware
 */
export const cacheHealthCheck = async (req, res, next) => {
  try {
    const stats = cacheManager.getStats();
    const isHealthy = stats.hitRate > 0.5 && stats.errors < 10;
    
    res.locals.cacheHealth = {
      healthy: isHealthy,
      stats
    };
    
    next();
  } catch (error) {
    res.locals.cacheHealth = {
      healthy: false,
      error: error.message
    };
    next();
  }
};

export default {
  cacheResponse,
  invalidateCache,
  cachePageContent,
  cachePageContentList,
  cacheHomepageSections,
  cacheHomepageSection,
  cacheContentSummary,
  cacheMediaList,
  invalidatePageContent,
  invalidateHomepageSections,
  invalidateMedia,
  invalidateAllContent,
  cacheForPublic,
  warmCache,
  cacheHealthCheck
};
