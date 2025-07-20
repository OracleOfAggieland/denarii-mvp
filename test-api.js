/**
 * Simple script to test the chat API endpoint
 * Run with: node test-api.js
 * Requires the development server to be running (npm run dev)
 */

const http = require('http');

const testCases = [
  {
    name: 'Valid message',
    data: { message: 'Hello, how are you?' },
    expectedStatus: [200, 500] // 500 if no API key configured
  },
  {
    name: 'Empty message',
    data: { message: '' },
    expectedStatus: [400]
  },
  {
    name: 'Missing message',
    data: {},
    expectedStatus: [400]
  },
  {
    name: 'With conversation history',
    data: {
      message: 'What did I just ask?',
      conversationHistory: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there! How can I help you?' }
      ]
    },
    expectedStatus: [200, 500]
  }
];

async function testAPI() {
  console.log('Testing Chat API...\n');

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    
    try {
      const response = await makeRequest(testCase.data);
      const isExpectedStatus = testCase.expectedStatus.includes(response.status);
      
      console.log(`  Status: ${response.status} ${isExpectedStatus ? '✓' : '✗'}`);
      console.log(`  Response: ${JSON.stringify(response.data, null, 2)}`);
      
      if (!isExpectedStatus) {
        console.log(`  Expected status: ${testCase.expectedStatus.join(' or ')}`);
      }
    } catch (error) {
      console.log(`  Error: ${error.message}`);
    }
    
    console.log('');
  }
}

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Check if server is running first
const checkServer = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET',
  timeout: 2000
}, (res) => {
  console.log('Development server is running. Starting tests...\n');
  testAPI();
});

checkServer.on('error', () => {
  console.log('Development server is not running.');
  console.log('Please start it with: npm run dev');
  console.log('Then run this test again.');
});

checkServer.end();