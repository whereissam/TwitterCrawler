import axios from 'axios';

interface TwitterMetrics {
  like_count: number;
  reply_count: number;
  retweet_count: number;
  quote_count: number;
}

interface Tweet {
  id: string;
  author_id: string;
  created_at: string;
  public_metrics: TwitterMetrics;
}

export class TwitterService {
  private bearerToken: string;
  
  constructor() {
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN!;
    if (!this.bearerToken) {
      throw new Error('Twitter Bearer Token is required');
    }
  }

  async searchTweets(username: string): Promise<Tweet[]> {
    try {
      const url = new URL('https://api.x.com/2/tweets/search/recent');
      url.searchParams.append('query', `@${username} -is:retweet`);
      url.searchParams.append('tweet.fields', 'author_id,created_at,public_metrics');
      url.searchParams.append('max_results', '100');

      const response = await axios.get(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Twitter API error:', error);
      throw error;
    }
  }
}

