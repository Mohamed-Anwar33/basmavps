import mongoose from 'mongoose';

/**
 * Database optimization utilities
 * Provides indexing, query optimization, and performance monitoring
 */

class DatabaseOptimizer {
  constructor() {
    this.queryStats = new Map();
    this.slowQueries = [];
    this.indexRecommendations = new Set();
  }

  /**
   * Create optimized indexes for content management
   */
  async createOptimizedIndexes() {
    try {
      const db = mongoose.connection.db;
      
      // PageContent indexes
      await this.createIndexIfNotExists('pagecontents', [
        { pageType: 1, isActive: 1, status: 1 },
        { status: 1, publishedAt: -1 },
        { lastModified: -1 },
        { 'content.sections.type': 1 },
        { 'content.metadata.title.ar': 'text', 'content.metadata.title.en': 'text', 'content.metadata.description.ar': 'text', 'content.metadata.description.en': 'text' },
        { createdBy: 1, lastModified: -1 },
        { 'validation.isValid': 1, status: 1 }
      ]);

      // HomepageSection indexes
      await this.createIndexIfNotExists('homepagesections', [
        { sectionType: 1, isActive: 1 },
        { order: 1, isActive: 1 },
        { updatedAt: -1 },
        { isActive: 1, order: 1 }
      ]);

      // Media indexes
      await this.createIndexIfNotExists('media', [
        { fileType: 1, isPublic: 1 },
        { uploaderId: 1, createdAt: -1 },
        { tags: 1, isPublic: 1 },
        { 'meta.folder': 1, isPublic: 1 },
        { originalName: 'text', 'alt.ar': 'text', 'alt.en': 'text', tags: 'text' },
        { size: 1, fileType: 1 },
        { createdAt: -1 }
      ]);

      // ContentVersion indexes
      await this.createIndexIfNotExists('contentversions', [
        { contentId: 1, contentType: 1, version: -1 },
        { contentType: 1, createdAt: -1 },
        { createdBy: 1, createdAt: -1 }
      ]);

      // Admin indexes
      await this.createIndexIfNotExists('admins', [
        { email: 1 },
        { role: 1, isActive: 1 },
        { lastLogin: -1 }
      ]);

      // AuditLog indexes (if exists)
      await this.createIndexIfNotExists('auditlogs', [
        { adminId: 1, createdAt: -1 },
        { resource: 1, action: 1, createdAt: -1 },
        { resourceId: 1, createdAt: -1 },
        { createdAt: -1 }
      ]);

      } catch (error) {
      }
  }

  /**
   * Create index if it doesn't exist
   */
  async createIndexIfNotExists(collectionName, indexes) {
    try {
      const db = mongoose.connection.db;
      const collection = db.collection(collectionName);
      
      // Check if collection exists
      const collections = await db.listCollections({ name: collectionName }).toArray();
      if (collections.length === 0) {
        return;
      }

      const existingIndexes = await collection.indexes();
      const existingIndexNames = existingIndexes.map(idx => idx.name);

      for (const indexSpec of indexes) {
        try {
          // Generate index name
          const indexName = this.generateIndexName(indexSpec);
          
          // Check if index already exists
          if (existingIndexNames.includes(indexName)) {
            continue;
          }

          // Create index
          await collection.createIndex(indexSpec, { 
            name: indexName,
            background: true // Create in background to avoid blocking
          });
          
          } catch (indexError) {
          // Log but don't fail if individual index creation fails
          }
      }
    } catch (error) {
      }
  }

  /**
   * Generate index name from specification
   */
  generateIndexName(indexSpec) {
    return Object.entries(indexSpec)
      .map(([field, direction]) => {
        if (direction === 'text') return `${field}_text`;
        return `${field}_${direction}`;
      })
      .join('_');
  }

  /**
   * Monitor query performance
   */
  monitorQuery(queryName, executionTime, explain = null) {
    if (!this.queryStats.has(queryName)) {
      this.queryStats.set(queryName, {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        maxTime: 0,
        minTime: Infinity
      });
    }

    const stats = this.queryStats.get(queryName);
    stats.count++;
    stats.totalTime += executionTime;
    stats.avgTime = stats.totalTime / stats.count;
    stats.maxTime = Math.max(stats.maxTime, executionTime);
    stats.minTime = Math.min(stats.minTime, executionTime);

    // Track slow queries (> 100ms)
    if (executionTime > 100) {
      this.slowQueries.push({
        queryName,
        executionTime,
        timestamp: new Date(),
        explain
      });

      // Keep only last 100 slow queries
      if (this.slowQueries.length > 100) {
        this.slowQueries.shift();
      }

      // Generate index recommendations for slow queries
      this.generateIndexRecommendation(queryName, explain);
    }
  }

  /**
   * Generate index recommendations based on slow queries
   */
  generateIndexRecommendation(queryName, explain) {
    if (!explain) return;

    // Analyze query execution plan and suggest indexes
    // This is a simplified version - in production, you'd want more sophisticated analysis
    if (explain.executionStats && explain.executionStats.executionTimeMillis > 100) {
      const recommendation = `Consider adding index for query: ${queryName}`;
      this.indexRecommendations.add(recommendation);
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    const stats = {};
    
    for (const [queryName, queryStats] of this.queryStats.entries()) {
      stats[queryName] = { ...queryStats };
    }

    return {
      queryStats: stats,
      slowQueries: this.slowQueries.slice(-10), // Last 10 slow queries
      indexRecommendations: Array.from(this.indexRecommendations),
      totalQueries: Array.from(this.queryStats.values()).reduce((sum, stat) => sum + stat.count, 0)
    };
  }

  /**
   * Optimize aggregation pipelines
   */
  optimizeAggregation(pipeline) {
    const optimized = [...pipeline];

    // Move $match stages to the beginning
    const matchStages = optimized.filter(stage => stage.$match);
    const otherStages = optimized.filter(stage => !stage.$match);
    
    // Sort $match stages by selectivity (smaller results first)
    matchStages.sort((a, b) => {
      const aKeys = Object.keys(a.$match).length;
      const bKeys = Object.keys(b.$match).length;
      return bKeys - aKeys; // More specific matches first
    });

    return [...matchStages, ...otherStages];
  }

  /**
   * Create query performance middleware
   */
  createPerformanceMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Override mongoose query execution
      const originalExec = mongoose.Query.prototype.exec;
      mongoose.Query.prototype.exec = function() {
        const queryStartTime = Date.now();
        const queryName = `${this.model.modelName}.${this.op}`;
        
        return originalExec.call(this).then(result => {
          const executionTime = Date.now() - queryStartTime;
          req.dbOptimizer?.monitorQuery(queryName, executionTime);
          return result;
        }).catch(error => {
          const executionTime = Date.now() - queryStartTime;
          req.dbOptimizer?.monitorQuery(`${queryName}_ERROR`, executionTime);
          throw error;
        });
      };

      req.dbOptimizer = this;
      req.queryStartTime = startTime;
      
      next();
    };
  }

  /**
   * Analyze collection statistics
   */
  async analyzeCollectionStats() {
    try {
      const db = mongoose.connection.db;
      const collections = ['pagecontents', 'homepagesections', 'media', 'contentversions', 'admins'];
      const stats = {};

      for (const collectionName of collections) {
        try {
          const collection = db.collection(collectionName);
          const collStats = await collection.stats();
          const indexes = await collection.indexes();
          
          stats[collectionName] = {
            count: collStats.count,
            size: collStats.size,
            avgObjSize: collStats.avgObjSize,
            storageSize: collStats.storageSize,
            indexes: indexes.length,
            indexSizes: collStats.indexSizes
          };
        } catch (error) {
          stats[collectionName] = { error: error.message };
        }
      }

      return stats;
    } catch (error) {
      return {};
    }
  }

  /**
   * Clean up old data to improve performance
   */
  async cleanupOldData() {
    try {
      const db = mongoose.connection.db;
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

      // Clean up old audit logs (keep last 30 days)
      try {
        const auditCollection = db.collection('auditlogs');
        const auditResult = await auditCollection.deleteMany({
          createdAt: { $lt: thirtyDaysAgo }
        });
        } catch (error) {
        }

      // Clean up old content versions (keep last 6 months)
      try {
        const versionCollection = db.collection('contentversions');
        const versionResult = await versionCollection.deleteMany({
          createdAt: { $lt: sixMonthsAgo }
        });
        } catch (error) {
        }

      } catch (error) {
      }
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.queryStats.clear();
    this.slowQueries = [];
    this.indexRecommendations.clear();
  }
}

// Create singleton instance
const dbOptimizer = new DatabaseOptimizer();

export default dbOptimizer;

// Export utility functions
export const createOptimizedQuery = (model, conditions = {}, options = {}) => {
  const query = model.find(conditions);
  
  // Apply common optimizations
  if (options.select) {
    query.select(options.select);
  }
  
  if (options.populate) {
    query.populate(options.populate);
  }
  
  if (options.sort) {
    query.sort(options.sort);
  }
  
  if (options.limit) {
    query.limit(options.limit);
  }
  
  if (options.skip) {
    query.skip(options.skip);
  }
  
  // Use lean() for read-only operations
  if (options.lean !== false) {
    query.lean();
  }
  
  return query;
};

export const createOptimizedAggregation = (model, pipeline) => {
  const optimizedPipeline = dbOptimizer.optimizeAggregation(pipeline);
  return model.aggregate(optimizedPipeline);
};
