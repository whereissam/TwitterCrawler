import { DataCollector } from '../src/scheduler/data-collector';

async function main() {
  try {
    // Create a DataCollector instance with the username
    const collector = new DataCollector('alephium', {
        interval: 1,  // Collect every 5 minutes
        maxTweets: 200,
      });
      

    // Start the periodic tweet collection
    collector.startCollection();

    console.log(`Tweet collection job started for @alephium at ${new Date().toISOString()}`);
    console.log('Press Ctrl+C to stop the collection process.');

    // Optional: Provide a way to gracefully handle process termination
    process.on('SIGINT', () => {
      console.log('\nStopping tweet collection...');
      // Here you could add any cleanup logic if needed
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start tweet collection:', error);
    process.exit(1);
  }
}

main();