#!/usr/bin/env node

/**
 * Backup script before removing console.log statements
 * Creates a complete backup of the src directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '../src');
const backupDir = path.join(__dirname, '../backup-' + new Date().toISOString().replace(/[:.]/g, '-'));

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);
  let copiedFiles = 0;

  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copiedFiles += copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      copiedFiles++;
      console.log(`📄 Copied: ${path.relative(srcDir, srcPath)}`);
    }
  });

  return copiedFiles;
}


try {
  const copiedFiles = copyDirectory(srcDir, backupDir);
  
  
  // Create restore script
  const restoreScript = `#!/usr/bin/env node

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
const backupDir = '${backupDir}';

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
      console.log(\`📄 Restored: \${path.relative(dest, destPath)}\`);
    }
  });

  return restoredFiles;
}


try {
  const restoredFiles = restoreDirectory(backupDir, srcDir);
  
  
} catch (error) {
  process.exit(1);
}
`;

  fs.writeFileSync(path.join(__dirname, 'restore-backup.js'), restoreScript);
  
} catch (error) {
  process.exit(1);
}
