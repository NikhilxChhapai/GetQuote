#!/usr/bin/env node

/**
 * Deployment Script for GitHub Push
 * Usage: node deploy.js "commit message"
 * 
 * This script will:
 * 1. Check for sensitive files
 * 2. Add all changes
 * 3. Commit with message
 * 4. Push to GitHub
 * 5. Trigger Vercel deployment automatically
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkSensitiveFiles() {
  const sensitivePatterns = [
    '.env',
    '.env.local',
    '.env.production',
    '*.key',
    '*.pem',
    'secrets.json',
    'config/database.json'
  ];

  log('🔍 Checking for sensitive files...', 'yellow');
  
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    const files = gitStatus.split('\n').filter(line => line.trim());
    
    for (const file of files) {
      const filename = file.substring(3); // Remove git status prefix
      
      for (const pattern of sensitivePatterns) {
        if (filename.includes(pattern.replace('*', ''))) {
          log(`❌ WARNING: Sensitive file detected: ${filename}`, 'red');
          log('Please add this file to .gitignore before pushing!', 'red');
          process.exit(1);
        }
      }
    }
    
    log('✅ No sensitive files detected', 'green');
  } catch (error) {
    log('Error checking files: ' + error.message, 'red');
    process.exit(1);
  }
}

function deployToGitHub(commitMessage) {
  try {
    log('🚀 Starting deployment process...', 'blue');
    
    // Check for sensitive files first
    checkSensitiveFiles();
    
    // Add all changes
    log('📦 Adding changes...', 'yellow');
    execSync('git add .', { stdio: 'inherit' });
    
    // Commit changes
    log(`💾 Committing changes: "${commitMessage}"`, 'yellow');
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    
    // Push to GitHub
    log('🌐 Pushing to GitHub...', 'yellow');
    execSync('git push origin main', { stdio: 'inherit' });
    
    log('✅ Successfully deployed to GitHub!', 'green');
    log('🔄 Vercel will automatically deploy your changes', 'blue');
    log('🌍 Your website will be live in a few minutes!', 'green');
    
  } catch (error) {
    log('❌ Deployment failed: ' + error.message, 'red');
    process.exit(1);
  }
}

// Main execution
const commitMessage = process.argv[2];

if (!commitMessage) {
  log('❌ Please provide a commit message!', 'red');
  log('Usage: node deploy.js "your commit message"', 'yellow');
  log('Example: node deploy.js "Added new calculator feature"', 'yellow');
  process.exit(1);
}

deployToGitHub(commitMessage);
