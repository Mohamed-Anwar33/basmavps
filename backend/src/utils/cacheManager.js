import NodeCache from 'node-cache';
import Redis from 'redis';

/**
 * Cache Manager with multiple backend support (Memory, Redis)
 * Provides efficient caching for frequently accessed content
 */
class CacheManager {
  constructor(options = {}) {
    this.options = {
      defaultTTL: options.defaultTTL || 300, // 5 minutes default
      checkPeriod: options.checkPeriod || 60, // Check for expired keys every minute
      useRedis: options.useRedis || false,
      redisUrl: options.redisUrl || process.env.REDIS_URL,
      maxKeys: options.maxKeys || 1000,
      ...options
    };

    this.memoryCache = new NodeCache({
      stdTTL: this.options.defaultTTL,
      checkperiod: this.options.checkPeriod,
      maxKeys: this.options.maxKeys,
      useClones: false // Better performance, but be careful with object mutations
    });

    this.redisClient = null;
    this.isRedisConnected = false;

    if (this.options.useRedis && this.options.redisUrl) {
      this.initRedis();
    }

    // Cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0
    };
  }

  async initRedis() {
    try {
      this.redisClient = Redis.createClient({
        url: this.options.redisUrl,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('Redis connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Redis retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.redisClient.on('connect', () => {
        this.isRedisConnected = true;
      });

      this.redisClient.on('error', (err) => {
        this.isRedisConnected = false;
        this.stats.errors++;
      });

      this.redisClient.on('end', () => {
        this.isRedisConnected = false;
      });

      await this.redisClient.connect();
    } catch (error) {
      this.isRedisConnected = false;
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    try {
      let value = null;

      // Try Redis first if available
      if (this.isRedisConnected) {
        try {
          const redisValue = await this.redisClient.get(key);
          if (redisValue !== null) {
            value = JSON.parse(redisValue);
            this.stats.hits++;
            return value;
          }
        } catch (redisError) {
          this.stats.errors++;
        }
      }

      // Fallback to memory cache
      value = this.memoryCache.get(key);
      if (value !== undefined) {
        this.stats.hits++;
        return value;
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttl = null) {
    try {
      const actualTTL = ttl || this.options.defaultTTL;
      const serializedValue = JSON.stringify(value);

      // Set in Redis if available
      if (this.isRedisConnected) {
        try {
          await this.redisClient.setEx(key, actualTTL, serializedValue);
        } catch (redisError) {
          this.stats.errors++;
        }
      }

      // Always set in memory cache as fallback
      this.memoryCache.set(key, value, actualTTL);
      this.stats.sets++;
      
      return true;
    } catch (error) {
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async del(key) {
    try {
      // Delete from Redis if available
      if (this.isRedisConnected) {
        try {
          await this.redisClient.del(key);
        } catch (redisError) {
          this.stats.errors++;
        }
      }

      // Delete from memory cache
      this.memoryCache.del(key);
      this.stats.deletes++;
      
      return true;
    } catch (error) {
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern) {
    try {
      let deletedCount = 0;

      // Delete from Redis if available
      if (this.isRedisConnected) {
        try {
          const keys = await this.redisClient.keys(pattern);
          if (keys.length > 0) {
            await this.redisClient.del(keys);
            deletedCount += keys.length;
          }
        } catch (redisError) {
          this.stats.errors++;
        }
      }

      // Delete from memory cache
      const memoryKeys = this.memoryCache.keys();
      const matchingKeys = memoryKeys.filter(key => {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(key);
      });
      
      matchingKeys.forEach(key => {
        this.memoryCache.del(key);
        deletedCount++;
      });

      this.stats.deletes += deletedCount;
      return deletedCount;
    } catch (error) {
      this.stats.errors++;
      return 0;
    }
  }

  /**
   * Check if key exists in cache
   */
  async has(key) {
    try {
      // Check Redis first if available
      if (this.isRedisConnected) {
        try {
          const exists = await this.redisClient.exists(key);
          if (exists) return true;
        } catch (redisError) {
          this.stats.errors++;
        }
      }

      // Check memory cache
      return this.memoryCache.has(key);
    } catch (error) {
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Get or set pattern - fetch from cache or execute function and cache result
   */
  async getOrSet(key, fetchFunction, ttl = null) {
    try {
      // Try to get from cache first
      const cachedValue = await this.get(key);
      if (cachedValue !== null) {
        return cachedValue;
      }

      // Execute fetch function
      const value = await fetchFunction();
      
      // Cache the result
      await this.set(key, value, ttl);
      
      return value;
    } catch (error) {
      this.stats.errors++;
      
      // If caching fails, still try to execute the function
      try {
        return await fetchFunction();
      } catch (fetchError) {
        throw fetchError;
      }
    }
  }

  /**
   * Flush all cache
   */
  async flush() {
    try {
      // Flush Redis if available
      if (this.isRedisConnected) {
        try {
          await this.redisClient.flushDb();
        } catch (redisError) {
          this.stats.errors++;
        }
      }

      // Flush memory cache
      this.memoryCache.flushAll();
      
      return true;
    } catch (error) {
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const memoryStats = this.memoryCache.getStats();
    
    return {
      ...this.stats,
      memory: {
        keys: memoryStats.keys,
        hits: memoryStats.hits,
        misses: memoryStats.misses,
        ksize: memoryStats.ksize,
        vsize: memoryStats.vsize
      },
      redis: {
        connected: this.isRedisConnected
      },
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
    };
  }

  /**
   * Close connections
   */
  async close() {
    try {
      if (this.redisClient && this.isRedisConnected) {
        await this.redisClient.quit();
      }
      this.memoryCache.close();
    } catch (error) {
      }
  }
}

// Create singleton instance
const cacheManager = new CacheManager({
  useRedis: process.env.NODE_ENV === 'production',
  redisUrl: process.env.REDIS_URL,
  defaultTTL: parseInt(process.env.CACHE_TTL) || 300,
  maxKeys: parseInt(process.env.CACHE_MAX_KEYS) || 1000
});

export default cacheManager;

// Cache key generators for different content types
export const CacheKeys = {
  PAGE_CONTENT: (pageType) => `page:${pageType}`,
  PAGE_CONTENT_LIST: (filters = {}) => {
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    return `pages:list:${filterStr}`;
  },
  HOMEPAGE_SECTIONS: () => 'homepage:sections',
  HOMEPAGE_SECTION: (sectionType) => `homepage:section:${sectionType}`,
  CONTENT_SUMMARY: () => 'content:summary',
  MEDIA_LIST: (filters = {}) => {
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    return `media:list:${filterStr}`;
  },
  VERSION_HISTORY: (contentId, contentType) => `versions:${contentType}:${contentId}`,
  VALIDATION_RESULT: (pageType) => `validation:${pageType}`,
  ANALYTICS: (pageType, period) => `analytics:${pageType}:${period}`
};

// Cache invalidation patterns
export const InvalidationPatterns = {
  PAGE_CONTENT: (pageType) => [`page:${pageType}`, 'pages:list:*', 'content:summary'],
  HOMEPAGE_SECTIONS: () => ['homepage:*', 'content:summary'],
  MEDIA: () => ['media:*'],
  ALL_CONTENT: () => ['page:*', 'pages:*', 'homepage:*', 'content:*']
};
