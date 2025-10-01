#!/usr/bin/env node

/**
 * Restore script - Run this if console.log cleanup caused issues
 * Usage: node scripts/restore-backup.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '../src');
const backupDir = 'D:\بصمة تصميم تجربه نهائيه\backend\backup-2025-09-26T13-33-43-765Z';

function restoreDirectory(backup, dest) {
  if (!fs.existsSync(backup)) {
    return 0;
  }

  // Remove current src directory
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }

  // Copy backup to src
  fs.mkdirSync(dest, { recursive: true });
  
  const files = fs.readdirSync(backup);
  let restoredFiles = 0;

  files.forEach(file => {
    const backupPath = path.join(backup, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(backupPath);

    if (stat.isDirectory()) {
      restoredFiles += restoreDirectory(backupPath, destPath);
    } else {
      fs.copyFileSync(backupPath, destPath);
      restoredFiles++;
      console.log(`📄 Restored: ${path.relative(dest, destPath)}`);
    }
  });

  return restoredFiles;
}


try {
  const restoredFiles = restoreDirectory(backupDir, srcDir);
  
  
} catch (error) {
  process.exit(1);
}
