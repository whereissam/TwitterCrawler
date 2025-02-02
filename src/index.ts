import app from "./app.js";
import config from "./config/config.js";
import db from "./db/db.js";
import { DataCollector } from './scheduler/data-collector.js';

// Initialize database first (fail-fast)
db();

// Initialize data collector with configured username
const dataCollector = new DataCollector(config().TWITTER_USERNAME);

// Start the Twitter collection job
try {
  dataCollector.startTwitterCollection();
  console.log(`Started Twitter collection job for @${config().TWITTER_USERNAME}`);
} catch (error) {
  console.error('Failed to start Twitter collection job:', error);
  // Optionally: process.exit(1) if you want to fail-fast on cron initialization error
}

// Start the Express server
app.listen(config().PORT, () => {
  console.log(`Application is listening http://localhost:${config().PORT}`);
});