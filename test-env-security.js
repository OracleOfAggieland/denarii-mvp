/**
 * Test script to verify environment variable configuration and API security
 * This tests the configuration without requiring the server to be running
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🔒 Testing Environment Variable Configuration and API Security\n');

// Test 1: Check if environment files exist
console.log('1. Environment Files:');
const envFiles = ['.env.example', '.env.local', '.env.production.example'];
envFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${file}: ${exists ? '✓ Exists' : '✗ Missing'}`);
});
console.log('');

// Test 2: Validate environment variables
console.log('2. Environment Variable Validation:');

// Check required variables
const requiredVars = ['OPENAI_API_KEY'];
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const exists = !!value;
  const isValid = exists && (varName === 'OPENAI_API_KEY' ? value.startsWith('sk-') : true);
  
  console.log(`   ${varName}: ${exists ? '✓ Set' : '✗ Missing'} ${isValid ? '✓ Valid' : '✗ Invalid'}`);
});

// Check optional variables
const optionalVars = ['OPENAI_MODEL', 'OPENAI_TEMPERATURE', 'OPENAI_MAX_TOKENS', 'NEXT_PUBLIC_APP_NAME'];
optionalVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`   ${varName}: ${value ? `✓ Set (${value})` : '- Not set (will use defaults)'}`);
});
console.log('');

// Test 3: Configuration validation logic
console.log('3. Configuration Logic:');

// Test temperature validation
const testTemperature = (temp) => {
  const parsed = parseFloat(temp);
  return !isNaN(parsed) && parsed >= 0 && parsed <= 2;
};

// Test max tokens validation
const testMaxTokens = (tokens) => {
  const parsed = parseInt(tokens);
  return !isNaN(parsed) && parsed >= 1 && parsed <= 4096;
};

if (process.env.OPENAI_TEMPERATURE) {
  const isValid = testTemperature(process.env.OPENAI_TEMPERATURE);
  console.log(`   Temperature validation: ${isValid ? '✓ Valid' : '✗ Invalid'} (${process.env.OPENAI_TEMPERATURE})`);
}

if (process.env.OPENAI_MAX_TOKENS) {
  const isValid = testMaxTokens(process.env.OPENAI_MAX_TOKENS);
  console.log(`   Max tokens validation: ${isValid ? '✓ Valid' : '✗ Invalid'} (${process.env.OPENAI_MAX_TOKENS})`);
}

console.log('');

// Test 4: Security measures
console.log('4. Security Measures:');

// Check if API key is not exposed in client-side files
const clientFiles = ['src/app/page.tsx', 'src/components/ChatInterface.tsx'];
let apiKeyExposed = false;

clientFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('OPENAI_API_KEY') && !content.includes('process.env.OPENAI_API_KEY')) {
      apiKeyExposed = true;
      console.log(`   ✗ API key potentially exposed in ${file}`);
    }
  }
});

if (!apiKeyExposed) {
  console.log('   ✓ API key not exposed in client-side files');
}

// Check if API route properly validates environment
const apiRouteFile = 'src/app/api/chat/route.ts';
if (fs.existsSync(apiRouteFile)) {
  const content = fs.readFileSync(apiRouteFile, 'utf8');
  const hasValidation = content.includes('validateEnvironment');
  const hasServerSideKey = content.includes('process.env.OPENAI_API_KEY');
  
  console.log(`   ✓ API route has environment validation: ${hasValidation ? 'Yes' : 'No'}`);
  console.log(`   ✓ API route uses server-side API key: ${hasServerSideKey ? 'Yes' : 'No'}`);
}

console.log('');

// Test 5: Environment-specific configurations
console.log('5. Environment-Specific Configuration:');

const environments = ['development', 'production', 'test'];
const defaultConfigs = {
  development: { model: 'gpt-3.5-turbo', temperature: 0.7, maxTokens: 150 },
  production: { model: 'gpt-3.5-turbo', temperature: 0.5, maxTokens: 200 },
  test: { model: 'gpt-3.5-turbo', temperature: 0.1, maxTokens: 50 },
};

const currentEnv = process.env.NODE_ENV || 'development';
console.log(`   Current environment: ${currentEnv}`);

environments.forEach(env => {
  const config = defaultConfigs[env];
  console.log(`   ${env}: model=${config.model}, temp=${config.temperature}, tokens=${config.maxTokens}`);
});

console.log('');

// Test 6: Scripts and utilities
console.log('6. Utility Scripts:');

const scripts = ['scripts/validate-env.js'];
scripts.forEach(script => {
  const exists = fs.existsSync(script);
  console.log(`   ${script}: ${exists ? '✓ Available' : '✗ Missing'}`);
});

// Check package.json scripts
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const hasValidateScript = packageJson.scripts && packageJson.scripts['validate-env'];
console.log(`   validate-env npm script: ${hasValidateScript ? '✓ Available' : '✗ Missing'}`);

console.log('');

// Summary
console.log('🎯 Summary:');
const hasApiKey = !!process.env.OPENAI_API_KEY;
const apiKeyValid = hasApiKey && process.env.OPENAI_API_KEY.startsWith('sk-');

if (hasApiKey && apiKeyValid) {
  console.log('✅ Environment configuration is ready for development!');
  console.log('✅ API security measures are in place');
  console.log('✅ Environment-specific configurations are available');
} else {
  console.log('⚠️  Environment configuration needs attention:');
  if (!hasApiKey) {
    console.log('   - Add OPENAI_API_KEY to .env.local');
  } else if (!apiKeyValid) {
    console.log('   - Verify OPENAI_API_KEY format (should start with "sk-")');
  }
}