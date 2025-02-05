import axios, { AxiosError } from 'axios';
import { addDays, subDays, startOfDay, endOfDay, formatISO } from 'date-fns';

interface Tweet {
  id: string;
  author_id: string;
  created_at: string;
  public_metrics: {
    like_count: number;
    reply_count: number;
    retweet_count: number;
    quote_count: number;
  };
  text?: string; // Optional text field
}

// Error Handling Classes
class TwitterAPIError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'TwitterAPIError';
  }
}

class RateLimitError extends TwitterAPIError {
  constructor(message: string, public resetTime?: Date) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Configuration Interface
interface TwitterSearchConfig {
  days?: number;
  max_results?: number;
  pagination_token?: string;
  additional_fields?: string[];
}

// Search Result Structure
interface TwitterSearchResult {
  tweets: Tweet[];
  next_token?: string;
  result_count: number;
  newest_id?: string;
  oldest_id?: string;
}

export class TwitterService {
  private bearerToken: string;
  private rateLimit = {
    remaining: 60,
    reset: new Date(),
    limit: 60
  };

  constructor() {
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN!;
    if (!this.bearerToken) {
      throw new Error('Twitter Bearer Token is required');
    }
  }

  // 🕒 Correct Date Range Calculation (Ensure UTC)
  private calculateDateRange() {
    const now = new Date();
  
    // Force the end_time to the current hour, minute, and second (UTC)
    const end_time = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),  // Exact current UTC hour
      0,  // Force minute to 00
      0   // Force second to 00
    )).toISOString().replace(/\.\d{3}Z$/, 'Z'); // Remove milliseconds
  
    return { end_time };
  }
  
  

  // ⏰ Convert Date to UTC Format
  private toUTCString(date: Date): string {
    return formatISO(date).replace(/\+\d{2}:\d{2}$/, 'Z'); // Ensures UTC format
  }

  // 🔍 Correct Query Construction (Ensuring Spaces)
  private constructTwitterQuery(username: string): string {
    return `@${username} -is:retweet`;
  }

  // 🚀 Main Function to Search Tweets
  async searchTweets(username: string, config: TwitterSearchConfig = {}): Promise<TwitterSearchResult> {
    // 🔍 Rate Limit Check
    this.checkRateLimit();

    try {
      // 📅 Get Correct Date Range
      const { end_time } = this.calculateDateRange();

      // 🌐 Construct API URL
      const url = new URL('https://api.x.com/2/tweets/search/recent');

      url.searchParams.set('query', `@${username} -is:retweet`);
      url.searchParams.set(
        'tweet.fields',
        config.additional_fields
          ? ['author_id', 'created_at', 'public_metrics', ...config.additional_fields].join(',')
          : 'author_id,created_at,public_metrics'
      );
      url.searchParams.set('user.fields', 'username');
      url.searchParams.set('max_results', String(config.max_results || 100));
      // url.searchParams.set('start_time', start_time);
      url.searchParams.set('end_time', end_time);

      if (config.pagination_token) {
        url.searchParams.set('pagination_token', config.pagination_token);
      }

      // 📢 Debugging Output
      console.log(`[DEBUG] Constructed Query: "${this.constructTwitterQuery(username)}"`);
      console.log(`[DEBUG] Final API URL: ${url.toString()}`);

      // 🛰 API Request
      const response = await axios.get(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Accept': 'application/json'
        }
      });

      // ✅ Process Response
      const result: TwitterSearchResult = {
        tweets: response.data.data || [],
        next_token: response.data.meta?.next_token,
        result_count: response.data.meta?.result_count || 0,
        newest_id: response.data.meta?.newest_id,
        oldest_id: response.data.meta?.oldest_id
      };

      console.log(`[INFO] Collected ${result.tweets.length} tweets.`);
      return result;
    } catch (error) {
      // ❌ Handle API Errors
      if (error instanceof AxiosError) {
        if (error.response?.status === 429) {
          throw new RateLimitError('Rate limit exceeded by Twitter API');
        }
        throw new TwitterAPIError('Twitter API request failed', error.response?.data);
      }

      console.error(`[ERROR] Twitter API Error:`, error);
      throw error;
    }
  }

  // ⚠️ Rate Limit Management
  private checkRateLimit() {
    const now = new Date();

    if (now >= this.rateLimit.reset) {
      this.rateLimit.remaining = this.rateLimit.limit;
      this.rateLimit.reset = addDays(now, 1);
    }

    if (this.rateLimit.remaining <= 0) {
      throw new RateLimitError('Rate limit exceeded', this.rateLimit.reset);
    }

    this.rateLimit.remaining--;
  }
}
