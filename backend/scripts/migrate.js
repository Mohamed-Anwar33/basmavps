#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MigrationRunner from '../src/utils/migrationRunner.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/basma-design';

/**
 * Migration CLI Script
 * 
 * Usage:
 *   node scripts/migrate.js up          - Run all pending migrations
 *   node scripts/migrate.js down <version> - Rollback specific migration
 *   node scripts/migrate.js status      - Show migration status
 */

async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
  } catch (error) {
    process.exit(1);
  }
}

async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
  } catch (error) {
  }
}

async function runMigrations() {
  const runner = new MigrationRunner();
  
  try {
    const result = await runner.runPendingMigrations();
    
    
    if (result.results.length > 0) {
      result.results.forEach(r => {
        const status = r.success ? '✓' : '✗';
        const time = r.executionTime ? ` (${r.executionTime}ms)` : '';
        if (r.error) {
        }
      });
    }
    
  } catch (error) {
    process.exit(1);
  }
}

async function rollbackMigration(version) {
  if (!version) {
    process.exit(1);
  }
  
  const runner = new MigrationRunner();
  
  try {
    await runner.rollbackMigration(version);
  } catch (error) {
    process.exit(1);
  }
}

async function showStatus() {
  const runner = new MigrationRunner();
  
  try {
    const status = await runner.getStatus();
    
    
    if (status.pending > 0) {
      const pendingMigrations = status.availableMigrations.filter(m => 
        !status.executedMigrations.some(e => e.version === m.version)
      );
      pendingMigrations.forEach(m => {
        if (m.description) {
        }
      });
    }
    
    if (status.executedMigrations.length > 0) {
      status.executedMigrations.forEach(m => {
        const statusIcon = m.status === 'completed' ? '✓' : 
                          m.status === 'failed' ? '✗' : '↶';
        const time = m.executionTime ? ` (${m.executionTime}ms)` : '';
        console.log(`    Executed: ${new Date(m.executedAt).toLocaleString()}`);
      });
    }
    
  } catch (error) {
    process.exit(1);
  }
}

async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];
  
  await connectDatabase();
  
  try {
    switch (command) {
      case 'up':
        await runMigrations();
        break;
        
      case 'down':
        await rollbackMigration(arg);
        break;
        
      case 'status':
        await showStatus();
        break;
        
      default:
        process.exit(1);
    }
  } finally {
    await disconnectDatabase();
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  process.exit(1);
});

// Run the CLI
main().catch(error => {
  process.exit(1);
});