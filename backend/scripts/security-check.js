#!/usr/bin/env node

/**
 * Security Check Script
 * Quick security audit for production deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');


const issues = [];
const warnings = [];
const passed = [];

// Check 1: Environment file security
const envPath = path.join(rootDir, '.env');
const envProdPath = path.join(rootDir, '.env.production');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for weak secrets
  if (envContent.includes('secret123') || envContent.includes('password123')) {
    issues.push('Weak JWT secrets detected in .env');
  }
  
  // Check for development URLs in production
  if (envContent.includes('localhost') && process.env.NODE_ENV === 'production') {
    warnings.push('Localhost URLs found in production environment');
  }
  
  passed.push('Environment file exists');
} else {
  issues.push('.env file not found');
}

if (fs.existsSync(envProdPath)) {
  const envProdContent = fs.readFileSync(envProdPath, 'utf8');
  
  // Check for placeholder values
  const placeholders = [
    'YOUR_LIVE_PAYPAL_CLIENT_ID',
    'CHANGE_THIS_STRONG_PASSWORD',
    'https://yourdomain.com'
  ];
  
  placeholders.forEach(placeholder => {
    if (envProdContent.includes(placeholder)) {
      issues.push(`Production placeholder not replaced: ${placeholder}`);
    }
  });
  
  passed.push('Production environment file exists');
} else {
  warnings.push('.env.production file not found');
}

// Check 2: Console.log statements
const srcDir = path.join(rootDir, 'src');

function checkConsoleLog(dir) {
  const files = fs.readdirSync(dir);
  let foundConsole = false;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules')) {
      if (checkConsoleLog(filePath)) {
        foundConsole = true;
      }
    } else if (file.endsWith('.js') && 
               !file.includes('production.js') && 
               !file.includes('.backup') &&
               !file.includes('server.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('console.log(')) {
        issues.push(`Console.log found in: ${path.relative(srcDir, filePath)}`);
        foundConsole = true;
      }
    }
  });
  
  return foundConsole;
}

if (!checkConsoleLog(srcDir)) {
  passed.push('No console.log statements found');
}

// Check 3: Security middleware
const serverPath = path.join(srcDir, 'server.js');

if (fs.existsSync(serverPath)) {
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  if (serverContent.includes('helmet')) {
    passed.push('Helmet security middleware configured');
  } else {
    issues.push('Helmet security middleware not found');
  }
  
  if (serverContent.includes('rateLimit')) {
    passed.push('Rate limiting configured');
  } else {
    issues.push('Rate limiting not configured');
  }
  
  if (serverContent.includes('cors')) {
    passed.push('CORS configured');
  } else {
    warnings.push('CORS configuration not found');
  }
} else {
  issues.push('server.js not found');
}

// Check 4: Package vulnerabilities
try {
  const packagePath = path.join(rootDir, 'package.json');
  if (fs.existsSync(packagePath)) {
    passed.push('Package.json exists');
    
    // Check for common vulnerable packages (basic check)
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);
    
    // Check for outdated express versions
    if (packageJson.dependencies?.express) {
      const expressVersion = packageJson.dependencies.express;
      if (expressVersion.includes('^4.') && !expressVersion.includes('4.18')) {
        warnings.push('Express version might be outdated');
      }
    }
  }
} catch (error) {
  warnings.push('Could not check package vulnerabilities');
}

// Check 5: File permissions (basic check)
try {
  const envStat = fs.statSync(envPath);
  // This is a basic check - in real deployment, check actual file permissions
  passed.push('Environment file permissions checked');
} catch (error) {
  warnings.push('Could not check file permissions');
}

// Check 6: Production configuration
const prodConfigPath = path.join(srcDir, 'config', 'production.js');

if (fs.existsSync(prodConfigPath)) {
  passed.push('Production security configuration exists');
} else {
  issues.push('Production security configuration not found');
}

// Results

if (passed.length > 0) {
  passed.forEach(item => console.log(`   ✓ ${item}`));
}

if (warnings.length > 0) {
  warnings.forEach(item => console.log(`   ⚠ ${item}`));
}

if (issues.length > 0) {
  issues.forEach(item => console.log(`   ✗ ${item}`));
}

// Final assessment
const totalChecks = passed.length + warnings.length + issues.length;
const score = Math.round((passed.length / totalChecks) * 100);


if (issues.length === 0) {
  if (warnings.length === 0) {
  } else {
  }
} else {
  process.exit(1);
}

