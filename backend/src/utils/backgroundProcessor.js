import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Background processor for heavy operations
 * Handles media processing, content optimization, and other CPU-intensive tasks
 */
class BackgroundProcessor extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      maxWorkers: options.maxWorkers || 4,
      workerTimeout: options.workerTimeout || 30000, // 30 seconds
      retryAttempts: options.retryAttempts || 3,
      retryDelay: options.retryDelay || 1000,
      ...options
    };

    this.workers = new Map();
    this.jobQueue = [];
    this.activeJobs = new Map();
    this.completedJobs = new Map();
    this.failedJobs = new Map();
    this.jobIdCounter = 0;

    this.stats = {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      activeJobs: 0,
      avgProcessingTime: 0
    };
  }

  /**
   * Add job to processing queue
   */
  async addJob(type, data, options = {}) {
    const jobId = ++this.jobIdCounter;
    const job = {
      id: jobId,
      type,
      data,
      options: {
        priority: options.priority || 'normal',
        timeout: options.timeout || this.options.workerTimeout,
        retryAttempts: options.retryAttempts || this.options.retryAttempts,
        ...options
      },
      createdAt: new Date(),
      attempts: 0,
      status: 'queued'
    };

    this.jobQueue.push(job);
    this.stats.totalJobs++;

    // Sort queue by priority
    this.jobQueue.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      return priorityOrder[b.options.priority] - priorityOrder[a.options.priority];
    });

    this.emit('jobQueued', job);
    this.processQueue();

    return jobId;
  }

  /**
   * Process job queue
   */
  async processQueue() {
    if (this.jobQueue.length === 0 || this.workers.size >= this.options.maxWorkers) {
      return;
    }

    const job = this.jobQueue.shift();
    if (!job) return;

    try {
      await this.processJob(job);
    } catch (error) {
      this.handleJobFailure(job, error);
    }

    // Continue processing queue
    setImmediate(() => this.processQueue());
  }

  /**
   * Process individual job
   */
  async processJob(job) {
    const startTime = Date.now();
    job.status = 'processing';
    job.startedAt = new Date();
    job.attempts++;

    this.activeJobs.set(job.id, job);
    this.stats.activeJobs++;
    this.emit('jobStarted', job);

    try {
      const worker = await this.createWorker(job);
      const result = await this.runWorker(worker, job);

      // Job completed successfully
      const processingTime = Date.now() - startTime;
      job.status = 'completed';
      job.completedAt = new Date();
      job.processingTime = processingTime;
      job.result = result;

      this.activeJobs.delete(job.id);
      this.completedJobs.set(job.id, job);
      
      this.stats.activeJobs--;
      this.stats.completedJobs++;
      this.updateAvgProcessingTime(processingTime);

      this.emit('jobCompleted', job);
      this.cleanupWorker(worker);

    } catch (error) {
      this.handleJobFailure(job, error);
    }
  }

  /**
   * Handle job failure
   */
  async handleJobFailure(job, error) {
    job.status = 'failed';
    job.error = error.message;
    job.failedAt = new Date();

    this.activeJobs.delete(job.id);
    this.stats.activeJobs--;

    // Retry if attempts remaining
    if (job.attempts < job.options.retryAttempts) {
      // Add delay before retry
      setTimeout(() => {
        job.status = 'queued';
        this.jobQueue.unshift(job); // Add to front of queue for retry
        this.processQueue();
      }, this.options.retryDelay * job.attempts);

      this.emit('jobRetry', job);
    } else {
      // Max retries exceeded
      this.failedJobs.set(job.id, job);
      this.stats.failedJobs++;
      this.emit('jobFailed', job);
    }
  }

  /**
   * Create worker for job type
   */
  async createWorker(job) {
    const workerScript = this.getWorkerScript(job.type);
    
    const worker = new Worker(workerScript, {
      workerData: {
        jobId: job.id,
        type: job.type,
        data: job.data,
        options: job.options
      }
    });

    this.workers.set(job.id, worker);
    return worker;
  }

  /**
   * Run worker and handle communication
   */
  async runWorker(worker, job) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        worker.terminate();
        reject(new Error(`Job ${job.id} timed out after ${job.options.timeout}ms`));
      }, job.options.timeout);

      worker.on('message', (result) => {
        clearTimeout(timeout);
        resolve(result);
      });

      worker.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      worker.on('exit', (code) => {
        clearTimeout(timeout);
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  /**
   * Get worker script path for job type
   */
  getWorkerScript(jobType) {
    const workerScripts = {
      'image-optimization': path.join(__dirname, '../workers/imageOptimizationWorker.js'),
      'content-analysis': path.join(__dirname, '../workers/contentAnalysisWorker.js'),
      'cache-warming': path.join(__dirname, '../workers/cacheWarmingWorker.js'),
      'data-export': path.join(__dirname, '../workers/dataExportWorker.js'),
      'media-processing': path.join(__dirname, '../workers/mediaProcessingWorker.js')
    };

    const scriptPath = workerScripts[jobType];
    if (!scriptPath) {
      throw new Error(`Unknown job type: ${jobType}`);
    }

    return scriptPath;
  }

  /**
   * Cleanup worker
   */
  cleanupWorker(worker) {
    try {
      worker.terminate();
    } catch (error) {
      }
  }

  /**
   * Get job status
   */
  getJobStatus(jobId) {
    if (this.activeJobs.has(jobId)) {
      return this.activeJobs.get(jobId);
    }
    if (this.completedJobs.has(jobId)) {
      return this.completedJobs.get(jobId);
    }
    if (this.failedJobs.has(jobId)) {
      return this.failedJobs.get(jobId);
    }
    
    // Check if job is in queue
    const queuedJob = this.jobQueue.find(job => job.id === jobId);
    if (queuedJob) {
      return queuedJob;
    }

    return null;
  }

  /**
   * Cancel job
   */
  async cancelJob(jobId) {
    // Remove from queue if not started
    const queueIndex = this.jobQueue.findIndex(job => job.id === jobId);
    if (queueIndex !== -1) {
      const job = this.jobQueue.splice(queueIndex, 1)[0];
      job.status = 'cancelled';
      this.emit('jobCancelled', job);
      return true;
    }

    // Terminate active job
    if (this.activeJobs.has(jobId)) {
      const job = this.activeJobs.get(jobId);
      const worker = this.workers.get(jobId);
      
      if (worker) {
        await worker.terminate();
        this.workers.delete(jobId);
      }

      job.status = 'cancelled';
      job.cancelledAt = new Date();
      
      this.activeJobs.delete(jobId);
      this.stats.activeJobs--;
      
      this.emit('jobCancelled', job);
      return true;
    }

    return false;
  }

  /**
   * Get processing statistics
   */
  getStats() {
    return {
      ...this.stats,
      queueLength: this.jobQueue.length,
      activeWorkers: this.workers.size,
      completedJobsCount: this.completedJobs.size,
      failedJobsCount: this.failedJobs.size
    };
  }

  /**
   * Update average processing time
   */
  updateAvgProcessingTime(processingTime) {
    const totalCompleted = this.stats.completedJobs;
    this.stats.avgProcessingTime = 
      ((this.stats.avgProcessingTime * (totalCompleted - 1)) + processingTime) / totalCompleted;
  }

  /**
   * Clean up old completed/failed jobs
   */
  cleanup() {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const cutoff = Date.now() - maxAge;

    // Clean completed jobs
    for (const [jobId, job] of this.completedJobs.entries()) {
      if (job.completedAt && job.completedAt.getTime() < cutoff) {
        this.completedJobs.delete(jobId);
      }
    }

    // Clean failed jobs
    for (const [jobId, job] of this.failedJobs.entries()) {
      if (job.failedAt && job.failedAt.getTime() < cutoff) {
        this.failedJobs.delete(jobId);
      }
    }
  }

  /**
   * Shutdown processor
   */
  async shutdown() {
    // Cancel all queued jobs
    this.jobQueue.forEach(job => {
      job.status = 'cancelled';
      this.emit('jobCancelled', job);
    });
    this.jobQueue = [];

    // Terminate all active workers
    const terminationPromises = Array.from(this.workers.values()).map(worker => 
      worker.terminate().catch(err => console.error('Worker termination error:', err))
    );
    
    await Promise.all(terminationPromises);
    this.workers.clear();
    this.activeJobs.clear();

    }
}

// Create singleton instance
const backgroundProcessor = new BackgroundProcessor({
  maxWorkers: parseInt(process.env.MAX_BACKGROUND_WORKERS) || 4,
  workerTimeout: parseInt(process.env.WORKER_TIMEOUT) || 30000
});

// Cleanup old jobs every hour
setInterval(() => {
  backgroundProcessor.cleanup();
}, 60 * 60 * 1000);

// Graceful shutdown
process.on('SIGTERM', async () => {
  await backgroundProcessor.shutdown();
});

process.on('SIGINT', async () => {
  await backgroundProcessor.shutdown();
});

export default backgroundProcessor;

// Convenience functions for common job types
export const optimizeImage = (imageData, options = {}) => {
  return backgroundProcessor.addJob('image-optimization', imageData, {
    priority: 'normal',
    ...options
  });
};

export const analyzeContent = (contentData, options = {}) => {
  return backgroundProcessor.addJob('content-analysis', contentData, {
    priority: 'low',
    ...options
  });
};

export const warmCache = (cacheKeys, options = {}) => {
  return backgroundProcessor.addJob('cache-warming', cacheKeys, {
    priority: 'low',
    ...options
  });
};

export const exportData = (exportConfig, options = {}) => {
  return backgroundProcessor.addJob('data-export', exportConfig, {
    priority: 'normal',
    ...options
  });
};

export const processMedia = (mediaData, options = {}) => {
  return backgroundProcessor.addJob('media-processing', mediaData, {
    priority: 'normal',
    ...options
  });
};
