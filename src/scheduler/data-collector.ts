import cron from 'node-cron';
import { TwitterService } from '../service/twitter-service.js';
import db from "../db/db.js";
import { tweetSnapshots } from '../db/schema.js';

interface Tweet {
  id: string;
  author_id: string;
  created_at: string;
  public_metrics: {
    retweet_count?: number;
    reply_count?: number;
    like_count?: number;
    quote_count?: number;
  };
}

export class DataCollector {
  private twitterService: TwitterService;
  private username: string;

  constructor(username: string) {
    this.twitterService = new TwitterService();
    this.username = username;
  }

  startCollection() {
    // Run every 5 minutes for testing
    cron.schedule('*/1 * * * *', async () => {
      console.log(`Collecting tweets for @${this.username} at ${new Date().toISOString()}`);
      
      try {
        const tweets = await this.twitterService.searchTweets(this.username);
        
        if (tweets.length === 0) {
          console.log('No tweets found');
          return;
        }

        await this.saveTweets(tweets);
        console.log(`Saved ${tweets.length} tweets`);
      } catch (error) {
        console.error('Collection failed:', error);
      }
    });
  }

  private async saveTweets(tweets: Tweet[]) {
    await db().transaction(async (tx) => {
      for (const tweet of tweets) {
        await tx.insert(tweetSnapshots).values({
          post_id: tweet.id,
          author_id: tweet.author_id,
          mentioned_username: this.username,
          created_at: new Date(tweet.created_at),
          saved_at: new Date(),
          public_metrics: JSON.stringify(tweet.public_metrics)
        });
      }
    });
  }
}