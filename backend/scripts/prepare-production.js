#!/usr/bin/env node

/**
 * Production Preparation Script
 * Comprehensive script to prepare the application for production deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

// Production checklist
const checklist = {
  backup: false,
  consoleLogs: false,
  envCheck: false,
  security: false,
  dependencies: false,
  tests: false
};


// Step 1: Create backup
try {
  execSync('node scripts/backup-before-cleanup.js', { cwd: rootDir, stdio: 'inherit' });
  checklist.backup = true;
} catch (error) {
  process.exit(1);
}

// Step 2: Check console.log statements (dry run first)
try {
  execSync('node scripts/remove-console-logs.js --dry-run', { cwd: rootDir, stdio: 'inherit' });
  
  const answer = await askQuestion('\n❓ Do you want to remove console.log statements? (y/N): ');
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    execSync('node scripts/remove-console-logs.js', { cwd: rootDir, stdio: 'inherit' });
    checklist.consoleLogs = true;
  } else {
  }
} catch (error) {
}

// Step 3: Environment variables check
const envIssues = checkEnvironmentVariables();
if (envIssues.length === 0) {
  checklist.envCheck = true;
} else {
  envIssues.forEach(issue => console.log(`   - ${issue}`));
}

// Step 4: Security check
const securityIssues = checkSecurityConfig();
if (securityIssues.length === 0) {
  checklist.security = true;
} else {
  securityIssues.forEach(issue => console.log(`   - ${issue}`));
}

// Step 5: Dependencies check
try {
  execSync('npm audit --audit-level moderate', { cwd: rootDir, stdio: 'pipe' });
  checklist.dependencies = true;
} catch (error) {
}

// Step 6: Basic tests
try {
  // Check if server starts without errors
  const testResult = testServerStart();
  if (testResult) {
    checklist.tests = true;
  } else {
  }
} catch (error) {
}

// Final report
Object.entries(checklist).forEach(([key, status]) => {
  const icon = status ? '✅' : '❌';
  const label = key.charAt(0).toUpperCase() + key.slice(1);
});

const readyCount = Object.values(checklist).filter(Boolean).length;
const totalChecks = Object.keys(checklist).length;


if (readyCount === totalChecks) {
} else {
}

// Helper functions
function checkEnvironmentVariables() {
  const issues = [];
  const envPath = path.join(rootDir, '.env.production');
  
  if (!fs.existsSync(envPath)) {
    issues.push('.env.production file not found');
    return issues;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for placeholder values
  const placeholders = [
    'YOUR_LIVE_PAYPAL_CLIENT_ID',
    'YOUR_PRODUCTION_AWS_ACCESS_KEY',
    'YOUR_PRODUCTION_EMAIL@yourdomain.com',
    'CHANGE_THIS_STRONG_PASSWORD',
    'https://yourdomain.com'
  ];
  
  placeholders.forEach(placeholder => {
    if (envContent.includes(placeholder)) {
      issues.push(`Replace placeholder: ${placeholder}`);
    }
  });
  
  return issues;
}

function checkSecurityConfig() {
  const issues = [];
  
  // Check if production config exists
  const prodConfigPath = path.join(srcDir, 'config', 'production.js');
  if (!fs.existsSync(prodConfigPath)) {
    issues.push('Production security config not found');
  }
  
  // Check server.js for security middleware
  const serverPath = path.join(srcDir, 'server.js');
  if (fs.existsSync(serverPath)) {
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    if (!serverContent.includes('helmet')) {
      issues.push('Helmet security middleware not configured');
    }
    
    if (!serverContent.includes('rateLimit')) {
      issues.push('Rate limiting not configured');
    }
  }
  
  return issues;
}

function testServerStart() {
  try {
    // Simple syntax check
    execSync('node -c src/server.js', { cwd: rootDir, stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question(question, (answer) => {
      readline.close();
      resolve(answer);
    });
  });
}
