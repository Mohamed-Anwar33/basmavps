import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Migration tracking schema
const migrationSchema = new mongoose.Schema({
  version: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  executedAt: { type: Date, default: Date.now },
  executionTime: Number, // in milliseconds
  status: { type: String, enum: ['completed', 'failed', 'rolled_back'], default: 'completed' }
});

const Migration = mongoose.model('Migration', migrationSchema);

/**
 * Migration Runner Utility
 */
class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../migrations');
  }

  /**
   * Get all available migration files
   */
  async getAvailableMigrations() {
    try {
      const files = fs.readdirSync(this.migrationsPath);
      const migrationFiles = files
        .filter(file => file.endsWith('.js') && file.match(/^\d{3}_/))
        .sort();

      const migrations = [];
      
      for (const file of migrationFiles) {
        try {
          const migrationModule = await import(path.join(this.migrationsPath, file));
          const metadata = migrationModule.metadata || {
            version: file.split('_')[0],
            name: file.replace('.js', ''),
            description: 'No description provided'
          };
          
          migrations.push({
            file,
            ...metadata,
            up: migrationModule.up,
            down: migrationModule.down
          });
        } catch (error) {
          }
      }
      
      return migrations;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get executed migrations from database
   */
  async getExecutedMigrations() {
    try {
      return await Migration.find({}).sort({ version: 1 });
    } catch (error) {
      return [];
    }
  }

  /**
   * Get pending migrations
   */
  async getPendingMigrations() {
    const available = await this.getAvailableMigrations();
    const executed = await this.getExecutedMigrations();
    const executedVersions = new Set(executed.map(m => m.version));
    
    return available.filter(migration => !executedVersions.has(migration.version));
  }

  /**
   * Run a single migration
   */
  async runMigration(migration) {
    const startTime = Date.now();
    
    try {
      if (typeof migration.up !== 'function') {
        throw new Error('Migration must export an "up" function');
      }
      
      // Execute the migration
      await migration.up();
      
      const executionTime = Date.now() - startTime;
      
      // Record successful execution
      await Migration.create({
        version: migration.version,
        name: migration.name,
        description: migration.description,
        executionTime,
        status: 'completed'
      });
      
      return { success: true, executionTime };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      // Record failed execution
      try {
        await Migration.create({
          version: migration.version,
          name: migration.name,
          description: migration.description,
          executionTime,
          status: 'failed'
        });
      } catch (recordError) {
        }
      
      throw error;
    }
  }

  /**
   * Run all pending migrations
   */
  async runPendingMigrations() {
    const pending = await this.getPendingMigrations();
    
    if (pending.length === 0) {
      return { migrationsRun: 0, results: [] };
    }
    
    const results = [];
    let successCount = 0;
    
    for (const migration of pending) {
      try {
        const result = await this.runMigration(migration);
        results.push({ migration: migration.name, ...result });
        successCount++;
      } catch (error) {
        results.push({ 
          migration: migration.name, 
          success: false, 
          error: error.message 
        });
        
        // Stop on first failure to prevent data corruption
        break;
      }
    }
    
    return {
      migrationsRun: successCount,
      totalPending: pending.length,
      results
    };
  }

  /**
   * Rollback a specific migration
   */
  async rollbackMigration(version) {
    try {
      const available = await this.getAvailableMigrations();
      const migration = available.find(m => m.version === version);
      
      if (!migration) {
        throw new Error(`Migration ${version} not found`);
      }
      
      if (typeof migration.down !== 'function') {
        throw new Error('Migration must export a "down" function for rollback');
      }
      
      const startTime = Date.now();
      await migration.down();
      const executionTime = Date.now() - startTime;
      
      // Update migration record
      await Migration.findOneAndUpdate(
        { version },
        { 
          status: 'rolled_back',
          executionTime: executionTime
        }
      );
      
      return { success: true, executionTime };
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async getStatus() {
    const available = await this.getAvailableMigrations();
    const executed = await this.getExecutedMigrations();
    const pending = await this.getPendingMigrations();
    
    return {
      total: available.length,
      executed: executed.length,
      pending: pending.length,
      failed: executed.filter(m => m.status === 'failed').length,
      rolledBack: executed.filter(m => m.status === 'rolled_back').length,
      availableMigrations: available.map(m => ({
        version: m.version,
        name: m.name,
        description: m.description
      })),
      executedMigrations: executed.map(m => ({
        version: m.version,
        name: m.name,
        status: m.status,
        executedAt: m.executedAt,
        executionTime: m.executionTime
      }))
    };
  }
}

export default MigrationRunner;
