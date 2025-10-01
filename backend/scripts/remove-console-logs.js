#!/usr/bin/env node

/**
 * Script to remove console.log statements from production code
 * Usage: node scripts/remove-console-logs.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to process
const srcDir = path.join(__dirname, '../src');

// Patterns to remove (more precise patterns)
const consolePatterns = [
  // Match console.log with proper line boundaries
  /^\s*console\.log\([^)]*\);\s*$/gm,
  /^\s*console\.info\([^)]*\);\s*$/gm,
  /^\s*console\.debug\([^)]*\);\s*$/gm,
  // Keep console.warn and console.error for production
];

// Files to exclude from processing (critical files)
const excludeFiles = [
  'logger.js',
  'auditLogger.js',
  'errorHandler.js',
  'server.js', // Keep server logs for startup
  'production.js' // Keep production config logs
];

// File patterns to exclude
const excludePatterns = [
  /\.backup$/,
  /\.bak$/,
  /\.old$/
];

// Directories to exclude
const excludeDirs = [
  'node_modules',
  'backup-',
  'scripts'
];

function shouldProcessFile(filePath) {
  const fileName = path.basename(filePath);
  const dirName = path.basename(path.dirname(filePath));
  
  // Skip non-JS files
  if (!fileName.endsWith('.js')) {
    return false;
  }
  
  // Skip excluded files
  if (excludeFiles.includes(fileName)) {
    return false;
  }
  
  // Skip files matching exclude patterns
  if (excludePatterns.some(pattern => pattern.test(fileName))) {
    return false;
  }
  
  // Skip excluded directories
  if (excludeDirs.some(excludeDir => filePath.includes(excludeDir))) {
    return false;
  }
  
  return true;
}

function removeConsoleLogs(content) {
  let modified = content;
  
  consolePatterns.forEach(pattern => {
    modified = modified.replace(pattern, '');
  });
  
  // Remove empty lines that might be left behind
  modified = modified.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return modified;
}

function processDirectory(dir, isDryRun = false) {
  const files = fs.readdirSync(dir);
  let processedCount = 0;
  let removedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      const result = processDirectory(filePath, isDryRun);
      processedCount += result.processedCount;
      removedCount += result.removedCount;
    } else if (shouldProcessFile(filePath)) {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const modifiedContent = removeConsoleLogs(originalContent);
      
      if (originalContent !== modifiedContent) {
        const originalLines = originalContent.split('\n').length;
        const modifiedLines = modifiedContent.split('\n').length;
        const removedLines = originalLines - modifiedLines;
        
        if (isDryRun) {
          console.log(`🔍 Would process: ${path.relative(srcDir, filePath)} (would remove ${removedLines} lines)`);
        } else {
          fs.writeFileSync(filePath, modifiedContent, 'utf8');
          console.log(`✅ Processed: ${path.relative(srcDir, filePath)} (removed ${removedLines} lines)`);
        }
        
        removedCount += removedLines;
      }
      
      processedCount++;
    }
  });
  
  return { processedCount, removedCount };
}

// Check if this is a dry run
const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');

console.log('🧹 Starting console.log removal process...');
if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified\n');
} else {
  console.log('⚠️  LIVE MODE - Files will be modified\n');
}

try {
  const result = processDirectory(srcDir, isDryRun);
  
  console.log('\n📊 Summary:');
  console.log(`   Files processed: ${result.processedCount}`);
  console.log(`   Lines that would be removed: ${result.removedCount}`);
  
  if (isDryRun) {
    console.log('\n🔍 This was a dry run - no files were modified');
    console.log('💡 To actually remove console.log statements, run:');
    console.log('   node scripts/remove-console-logs.js');
  } else {
    
  }
  
} catch (error) {
  console.error('❌ Error during console.log removal:', error);
  process.exit(1);
}
