export interface TwitterMetrics {
    like_count: number;
    reply_count: number;
    retweet_count: number;
    quote_count: number;
  }
  
  export interface Tweet {
    id: string;
    author_id: string;
    created_at: string;
    public_metrics: TwitterMetrics;
  }
  
  export interface TwitterResponse {
    data: Tweet[];
    meta: {
      newest_id: string;
      oldest_id: string;
      result_count: number;
      next_token?: string;
    };
  }