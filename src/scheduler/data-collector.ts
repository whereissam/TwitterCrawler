import cron from 'node-cron';
import { TwitterService } from '../service/twitter-service.js';
import db from "../db/db.js";
import { tweetSnapshots } from '../db/schema.js';
import { formatInTimeZone } from 'date-fns-tz';

interface CollectionConfig {
  interval?: number;      // Collection interval in minutes
  maxTweets?: number;      // Maximum tweets to collect per run
}

export class DataCollector {
  private twitterService: TwitterService;
  private username: string;
  private config: CollectionConfig;

  constructor(
    username: string, 
    config: CollectionConfig = {}
  ) {
    this.twitterService = new TwitterService();
    this.username = username.replace('@', '');
    this.config = {
      interval: 1,     // Default: every minute
      maxTweets: 100,  // Default: 100 tweets per collection
      ...config
    };
  }

  startCollection() {
    // Use Asia/Singapore timezone (represents most of Southeast Asia)
    const asiaTimezone = 'Asia/Singapore';
    // Schedule to run daily at 8 AM in Asia time, you can chang here to testing. 00 is min, 08 is hour, * is day, * is month, * is day of week
    cron.schedule('00 08 * * *', async () => {
      try {
        // Get current date and format it in Asia timezone
        const currentTimeInAsia = formatInTimeZone(
          new Date(), 
          asiaTimezone, 
          "yyyy-MM-dd'T'HH:mm:ssXXX"
        );

        console.log(`[${currentTimeInAsia}] Starting tweet collection for @${this.username}`);

        await this.collectTweets();
      } catch (error) {
        this.handleCollectionError(error);
      }
    }, {
      scheduled: true,
      timezone: asiaTimezone
    });

    console.log(`Tweet collection scheduled daily at 8 AM ${asiaTimezone} for @${this.username}`);
  }

  private async collectTweets() {
    console.log(`[${new Date().toISOString()}] Starting tweet collection for @${this.username}`);
  
    let paginationToken: string | undefined;
    let totalCollectedThisRun = 0;
  
    while (totalCollectedThisRun < (this.config.maxTweets || 100)) {
      const result = await this.twitterService.searchTweets(this.username, {
        pagination_token: paginationToken,
        max_results: Math.min(
          this.config.maxTweets || 100, 
          100  // Twitter API max
        ),
      });
  
      if (result.tweets.length === 0) {
        console.log('No more tweets to collect');
        break;
      }
  
      await this.saveTweets(result.tweets);
  
      totalCollectedThisRun += result.tweets.length;
      paginationToken = result.next_token;
  
      if (!paginationToken) break;
    }
  
    console.log(`Collected ${totalCollectedThisRun} tweets`);
  }

  private async saveTweets(tweets: any[]) {
    const connection = db();
    await connection.transaction(async (tx) => {
      for (const tweet of tweets) {
        try {
          await tx.insert(tweetSnapshots).values({
            post_id: tweet.id,
            author_id: tweet.author_id,
            mentioned_username: this.username,
            created_at: new Date(tweet.created_at),
            saved_at: new Date(),
            public_metrics: JSON.stringify(tweet.public_metrics)
          }).onConflictDoNothing();
        } catch (error) {
          console.warn(`Error saving tweet ${tweet.id}:`, error);
        }
      }
    });
  }

  private handleCollectionError(error: unknown) {
    console.error('Tweet collection failed:', error);
  }
}