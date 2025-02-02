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

interface TwitterResponse {
  data: Tweet[];
  meta: {
    result_count: number;
    pagination_token?: string;  // Updated to use correct parameter name
  };
}

interface RateLimit {
  requestCount: number;
  windowStart: number;
  totalTweets: number;
}

export class TwitterService {
  private bearerToken: string;
  private baseUrl = 'https://api.x.com/2';
  private rateLimit: RateLimit = {
    requestCount: 0,
    windowStart: Date.now(),
    totalTweets: 0
  };
  
  private readonly MAX_REQUESTS = 60;  // requests per 15 minutes
  private readonly RATE_WINDOW = 15 * 60 * 1000;  // 15 minutes in ms
  private readonly MAX_TWEETS = 6000;  // maximum tweets per window
  
  constructor() {
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN!;
    if (!this.bearerToken) {
      throw new Error('Twitter Bearer Token is required');
    }
  }

  private async checkRateLimit(tweetCount: number): Promise<void> {
    const now = Date.now();
    
    // Reset window if 15 minutes have passed
    if (now - this.rateLimit.windowStart >= this.RATE_WINDOW) {
      this.rateLimit = {
        requestCount: 0,
        windowStart: now,
        totalTweets: 0
      };
      return;
    }

    // Check both request count and tweet count limits
    if (this.rateLimit.requestCount >= this.MAX_REQUESTS || 
        this.rateLimit.totalTweets + tweetCount > this.MAX_TWEETS) {
      const waitTime = this.RATE_WINDOW - (now - this.rateLimit.windowStart);
      console.log(`Rate limit reached, waiting ${waitTime/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.rateLimit = {
        requestCount: 0,
        windowStart: now,
        totalTweets: 0
      };
    }
  }

  async searchTweets(username: string, startTime: string, endTime: string): Promise<Tweet[]> {
    let allTweets: Tweet[] = [];
    let paginationToken: string | undefined;

    do {
      try {
        // Check rate limits before making request
        await this.checkRateLimit(100); // Assuming max possible tweets per request

        const response = await axios.get<TwitterResponse>(
          `${this.baseUrl}/tweets/search/recent`,
          {
            params: {
              query: `@${username} -is:retweet`,
              'tweet.fields': 'author_id,created_at,public_metrics',
              'user.fields': 'username',
              'max_results': 100,
              'start_time': startTime,
              'end_time': endTime,
              ...(paginationToken && { 'pagination_token': paginationToken })
            },
            headers: {
              'Authorization': `Bearer ${this.bearerToken}`
            }
          }
        );

        // Update rate limit tracking
        this.rateLimit.requestCount++;
        this.rateLimit.totalTweets += response.data.data?.length || 0;

        if (response.data.data) {
          allTweets = [...allTweets, ...response.data.data];
        }

        // Get pagination token for next request if available
        paginationToken = response.data.meta.pagination_token;

        // Add small delay between requests
        if (paginationToken) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          // If we hit rate limit, wait for the window to reset
          await new Promise(resolve => setTimeout(resolve, this.RATE_WINDOW));
          continue;
        }
        throw new Error(`Failed to fetch tweets: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } while (paginationToken && allTweets.length < this.MAX_TWEETS);

    return allTweets;
  }
}