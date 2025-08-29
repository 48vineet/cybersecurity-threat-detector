const HackathonNetworkAgent = require('./agents/NetworkDataCollector');

console.log('🚀 Starting Network Agent Test...');

// Create and start the network agent
const networkAgent = new HackathonNetworkAgent();

// Start the agent
networkAgent.start();

// Keep the script running
setInterval(() => {
  console.log('Network agent is running...');
}, 10000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down network agent...');
  networkAgent.stop();
  process.exit(0);
});

console.log('✅ Network agent test started. Press Ctrl+C to stop.');
