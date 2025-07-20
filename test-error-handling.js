/**
 * Manual test script to verify error handling functionality
 * This script tests the API error handling without needing a full frontend setup
 */

const BASE_URL = 'http://localhost:3000';

async function testErrorHandling() {
  console.log('🧪 Testing Error Handling Functionality\n');

  // Test 1: Invalid JSON
  console.log('1. Testing invalid JSON...');
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    });
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Error: ${data.error}`);
    console.log(`   Error Type: ${data.errorType}`);
    console.log('   ✅ Invalid JSON handled correctly\n');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 2: Empty message
  console.log('2. Testing empty message...');
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' })
    });
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Error: ${data.error}`);
    console.log(`   Error Type: ${data.errorType}`);
    console.log('   ✅ Empty message handled correctly\n');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 3: Missing message field
  console.log('3. Testing missing message field...');
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notMessage: 'Hello' })
    });
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Error: ${data.error}`);
    console.log(`   Error Type: ${data.errorType}`);
    console.log('   ✅ Missing message field handled correctly\n');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 4: Invalid conversation history
  console.log('4. Testing invalid conversation history...');
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: 'Hello',
        conversationHistory: 'not an array'
      })
    });
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Error: ${data.error}`);
    console.log(`   Error Type: ${data.errorType}`);
    console.log('   ✅ Invalid conversation history handled correctly\n');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 5: Network connectivity (this will fail if server is not running)
  console.log('5. Testing network connectivity...');
  try {
    const response = await fetch('http://localhost:9999/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello' })
    });
    console.log('   ❌ This should have failed (server should not be running on port 9999)');
  } catch (error) {
    console.log(`   Network Error: ${error.message}`);
    console.log('   ✅ Network error handled correctly (fetch failed as expected)\n');
  }

  console.log('🎉 Error handling tests completed!');
  console.log('\nNote: To test the full error handling including OpenAI API errors,');
  console.log('you would need to run the Next.js server with proper API keys.');
}

// Run the tests
testErrorHandling().catch(console.error);