#!/usr/bin/env node

/**
 * Environment validation script
 * Run this script to validate your environment configuration
 * Usage: node scripts/validate-env.js
 */

const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local if it exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

console.log('🔍 Validating environment configuration...\n');

// Environment validation logic (duplicated from TypeScript module for Node.js compatibility)
function getCurrentEnvironment() {
  const env = process.env.NODE_ENV;
  if (env === 'production') return 'production';
  if (env === 'test') return 'test';
  return 'development';
}

function validateEnvironment() {
  const warnings = [];
  
  // Check required environment variables
  if (!process.env.OPENAI_API_KEY) {
    return {
      isValid: false,
      error: 'OPENAI_API_KEY environment variable is required',
    };
  }

  // Validate API key format (OpenAI keys start with 'sk-')
  if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
    return {
      isValid: false,
      error: 'OPENAI_API_KEY appears to be invalid (should start with "sk-")',
    };
  }

  // Validate optional numeric environment variables
  if (process.env.OPENAI_TEMPERATURE) {
    const temp = parseFloat(process.env.OPENAI_TEMPERATURE);
    if (isNaN(temp) || temp < 0 || temp > 2) {
      return {
        isValid: false,
        error: 'OPENAI_TEMPERATURE must be a number between 0 and 2',
      };
    }
  }

  if (process.env.OPENAI_MAX_TOKENS) {
    const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS);
    if (isNaN(maxTokens) || maxTokens < 1 || maxTokens > 4096) {
      return {
        isValid: false,
        error: 'OPENAI_MAX_TOKENS must be a number between 1 and 4096',
      };
    }
  }

  // Check for production-specific requirements
  const currentEnv = getCurrentEnvironment();
  if (currentEnv === 'production') {
    if (!process.env.NEXT_PUBLIC_APP_NAME) {
      warnings.push('NEXT_PUBLIC_APP_NAME is not set for production');
    }
  }

  return { 
    isValid: true, 
    warnings: warnings.length > 0 ? warnings : undefined 
  };
}

function logEnvironmentInfo() {
  const currentEnv = getCurrentEnvironment();
  const defaults = {
    development: { model: 'gpt-3.5-turbo', temperature: 0.7, maxTokens: 150 },
    production: { model: 'gpt-3.5-turbo', temperature: 0.5, maxTokens: 200 },
    test: { model: 'gpt-3.5-turbo', temperature: 0.1, maxTokens: 50 },
  };
  
  const config = {
    model: process.env.OPENAI_MODEL || defaults[currentEnv].model,
    temperature: process.env.OPENAI_TEMPERATURE 
      ? parseFloat(process.env.OPENAI_TEMPERATURE) 
      : defaults[currentEnv].temperature,
    maxTokens: process.env.OPENAI_MAX_TOKENS 
      ? parseInt(process.env.OPENAI_MAX_TOKENS) 
      : defaults[currentEnv].maxTokens,
  };
  
  console.log(`Environment: ${currentEnv}`);
  console.log(`OpenAI Model: ${config.model}`);
  console.log(`Temperature: ${config.temperature}`);
  console.log(`Max Tokens: ${config.maxTokens}`);
  console.log(`API Key configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
}

// Log current environment info
logEnvironmentInfo();
console.log('');

// Validate environment
const validation = validateEnvironment();

if (validation.isValid) {
  console.log('✅ Environment validation passed!');
  
  if (validation.warnings && validation.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    validation.warnings.forEach(warning => {
      console.log(`   - ${warning}`);
    });
  }
  
  console.log('\n🚀 Your environment is ready for development!');
  process.exit(0);
} else {
  console.log('❌ Environment validation failed!');
  console.log(`   Error: ${validation.error}`);
  
  console.log('\n📝 To fix this issue:');
  console.log('   1. Copy .env.example to .env.local');
  console.log('   2. Add your OpenAI API key to .env.local');
  console.log('   3. Run this script again to validate');
  
  process.exit(1);
}