// simple-test.js - Basic test using ES modules
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

console.log('🚀 Starting basic test...');

// Test 1: Basic Node.js functionality
console.log('1. ✅ Console.log working');
console.log('2. ✅ Node.js version:', process.version);
console.log('3. ✅ Current directory:', process.cwd());

// Test 2: Check if .env file exists
console.log('4. 📄 .env file exists:', fs.existsSync('.env') ? 'Yes' : 'No');
console.log('5. 📄 .env.example exists:', fs.existsSync('.env.example') ? 'Yes' : 'No');

// Test 3: Try loading dotenv
try {
  const { config } = await import('dotenv');
  const result = config();
  console.log('6. ✅ dotenv loaded successfully');
  if (result.error) {
    console.log('   ⚠️ dotenv error:', result.error.message);
  } else {
    console.log('   📊 Environment variables loaded');
  }
} catch (error) {
  console.log('6. ❌ dotenv failed:', error.message);
  console.log('   💡 Run: npm install dotenv');
}

// Test 4: Check environment variables
console.log('\n🔍 Environment Variable Check:');
const requiredVars = [
  'GROQ_API_KEY',
  'RISK_AGENT_PRIVATE_KEY',
  'FINANCE_AGENT_PRIVATE_KEY', 
  'COMMUNITY_AGENT_PRIVATE_KEY',
  'TECH_AGENT_PRIVATE_KEY'
];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value && value !== 'your_' + varName.toLowerCase() && !value.startsWith('your_') ? '✅ Set' : '❌ Missing';
  console.log(`   ${varName}: ${status}`);
});

// Test 5: Try importing ethers
console.log('\n🌐 Testing Dependencies:');
try {
  const { ethers } = await import('ethers');
  console.log('7. ✅ ethers imported successfully');
  console.log('   Version:', ethers.version || 'v6.x');
} catch (error) {
  console.log('7. ❌ ethers import failed:', error.message);
  console.log('   💡 Run: npm install ethers');
}

// Test 6: Try importing groq-sdk
try {
  const Groq = await import('groq-sdk');
  console.log('8. ✅ groq-sdk imported successfully');
} catch (error) {
  console.log('8. ❌ groq-sdk import failed:', error.message);
  console.log('   💡 Run: npm install groq-sdk');
}

// Test 7: Simple network test with fetch (built into Node.js 18+)
console.log('\n🌐 Basic Network Test:');
const testUrl = 'https://rpc.testnet.citrea.xyz';
console.log('9. 🔗 Testing connection to:', testUrl);

try {
  const response = await fetch(testUrl, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('   ✅ Citrea RPC connection successful');
    console.log('   📊 Status:', response.status);
    console.log('   📦 Latest block (hex):', data.result || 'unknown');
  } else {
    console.log('   ⚠️ RPC responded with status:', response.status);
  }
} catch (error) {
  console.log('   ❌ Network test failed:', error.message);
  console.log('   💡 Check your internet connection');
}

// Test 8: Check if we have at least one configured env var
const configuredCount = requiredVars.filter(varName => {
  const value = process.env[varName];
  return value && !value.startsWith('your_');
}).length;

console.log('\n📋 Configuration Status:');
console.log(`   Configured variables: ${configuredCount}/${requiredVars.length}`);

if (configuredCount === 0) {
  console.log('\n⚠️ No environment variables configured!');
  console.log('\n🔧 Quick setup:');
  console.log('1. Copy template: copy .env.example .env');
  console.log('2. Edit .env file with your keys');
  console.log('3. Get Groq API key: https://console.groq.com/');
  console.log('4. Add funded Citrea private keys');
} else if (configuredCount < requiredVars.length) {
  console.log('\n⚠️ Partial configuration detected');
  console.log('💡 Edit your .env file to add missing variables');
} else {
  console.log('\n✅ All environment variables configured!');
  console.log('\n🚀 Ready to run:');
  console.log('   npm run demo      # Full demonstration');
  console.log('   npm run test-full # Complete system test');
}

console.log('\n🎉 Basic test completed!');

// Catch any unhandled errors
process.on('uncaughtException', (error) => {
  console.log('\n💥 Uncaught error:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.log('\n💥 Unhandled promise rejection:', reason);
  process.exit(1);
});