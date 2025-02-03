import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

if (!BEARER_TOKEN) {
  console.error('Error: TWITTER_BEARER_TOKEN is required in .env file');
  process.exit(1);
}

// Test configuration
const testConfig = {
  username: 'alephium',
  includeMetrics: true,
  maxResults: 10 // Start small for testing
};

async function testTwitterApi() {
  console.log('Starting Twitter API test...');
  console.log(`Testing for username: ${testConfig.username}`);

  try {
    const url = new URL('https://api.x.com/2/tweets/search/recent');
    url.searchParams.append('query', testConfig.username);
    url.searchParams.append('tweet.fields', 'public_metrics,author_id,created_at');
    url.searchParams.append('max_results', String(testConfig.maxResults));

    console.log('\nMaking request to:', url.toString());
    
    const response = await axios.get(url.toString(), {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`
      }
    });

    console.log('\nResponse Status:', response.status);
    console.log('\nResponse Headers:', JSON.stringify(response.headers, null, 2));
    console.log('\nResponse Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.data) {
      console.log(`\nFound ${response.data.data.length} tweets`);
    }

  } catch (error) {
    console.error('\nError details:');
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Response:', error.response?.data);
      console.error('Message:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Run the test
testTwitterApi().then(() => {
  console.log('\nTest completed');
}).catch((error) => {
  console.error('\nTest failed:', error);
});