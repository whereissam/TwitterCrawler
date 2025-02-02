import cron from 'node-cron';
import { TwitterService } from '../service/twitter-service.js';
import db from "../db/db.js";
import { tweetSnapshots } from '../db/schema.js';
import { Tweet } from '../types/twitter.js';

export class DataCollector {
  private twitterService: TwitterService;
  private targetUsername: string;

  constructor(username: string) {
    this.twitterService = new TwitterService();
    this.targetUsername = username;
  }

  startTwitterCollection() {
    cron.schedule('0 8 * * *', async () => {
      console.log(`Starting Twitter data collection for @${this.targetUsername}...`);
      
      try {
        // Calculate collection window
        const now = new Date();
        const endTime = new Date(now);
        endTime.setHours(8, 0, 0, 0);

        const startTime = new Date(endTime);
        startTime.setDate(startTime.getDate() - 1);

        console.log(`Collecting data from ${startTime.toISOString()} to ${endTime.toISOString()}`);

        const tweets = await this.twitterService.searchTweets(
          this.targetUsername,
          startTime.toISOString(),
          endTime.toISOString()
        );

        if (!tweets || tweets.length === 0) {
          console.log(`No tweets found mentioning @${this.targetUsername}`);
          return;
        }

        // Store raw tweet data
        await this.storeTweets(tweets);

        console.log(`Successfully collected ${tweets.length} mentions for @${this.targetUsername}`);
      } catch (error) {
        console.error(`Twitter collection job failed for @${this.targetUsername}:`, error);
      }
    }, {
      timezone: "Asia/Tokyo"
    });
  }

  private async storeTweets(tweets: Tweet[]) {
    return await db().transaction(async (tx) => {
      for (const tweet of tweets) {
        await tx.insert(tweetSnapshots).values({
          post_id: tweet.id,
          author_id: tweet.author_id,
          mentioned_username: this.targetUsername,
          created_at: new Date(tweet.created_at),
          saved_at: new Date(),
          public_metrics: JSON.stringify(tweet.public_metrics)
        });
      }
    });
  }
}