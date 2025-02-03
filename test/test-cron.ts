import { DataCollector } from '../src/scheduler/data-collector';

// Create a DataCollector instance with the username
const collector = new DataCollector('alephium');

// Start the periodic tweet collection
collector.startCollection();

console.log('Tweet collection job started for @alephium');
console.log('Press Ctrl+C to stop the collection process.');