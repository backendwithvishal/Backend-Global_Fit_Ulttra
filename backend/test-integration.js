#!/usr/bin/env node

/**
 * Integration Test Script
 * 
 * Quick test to verify AI integration is working
 */

import { config } from './src/config/environment.js';

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║         AI Integration Test                               ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Check environment
console.log('📋 Environment Check:\n');

console.log(`✓ Node.js: ${process.version}`);
console.log(`✓ Environment: ${config.server.nodeEnv}`);
console.log(`✓ Port: ${config.server.port}`);

// Check AI configuration
console.log('\n🤖 AI Configuration:\n');

if (config.ai.groqApiKey && config.ai.groqApiKey !== '') {
    console.log('✅ GROQ_API_KEY: Configured');
    console.log(`✓ Primary Model: ${config.ai.primaryModel}`);
    console.log(`✓ Fast Model: ${config.ai.fastModel}`);
} else {
    console.log('❌ GROQ_API_KEY: Not configured');
    console.log('\n⚠️  AI features will be disabled!');
    console.log('\nTo enable AI features:');
    console.log('1. Get API key from https://console.groq.com/keys');
    console.log('2. Add to .env: GROQ_API_KEY=gsk_your_key_here');
    console.log('3. Restart the server\n');
}

// Check Redis
console.log('\n💾 Redis Configuration:\n');
console.log(`✓ Host: ${config.redis.url}`);

// Check RabbitMQ
console.log('\n📨 RabbitMQ Configuration:\n');
console.log(`✓ URL: ${config.rabbitmq.url}`);
console.log('  (Optional - AI job queue will be disabled if not available)');

// Check MongoDB
console.log('\n🗄️  MongoDB Configuration:\n');
console.log(`✓ URI: ${config.database.uri}`);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📚 Next Steps:\n');

if (config.ai.groqApiKey && config.ai.groqApiKey !== '') {
    console.log('1. Start the server: npm run dev');
    console.log('2. Check health: curl http://localhost:3000/health');
    console.log('3. Test AI endpoint: curl -X POST http://localhost:3000/api/v1/ai/sentiment \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"text":"Stock market rallies"}\'');
    console.log('4. Open WebSocket chat: examples/websocket-client.html');
} else {
    console.log('1. Configure GROQ_API_KEY in .env');
    console.log('2. Start the server: npm run dev');
    console.log('3. Server will run without AI features');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
