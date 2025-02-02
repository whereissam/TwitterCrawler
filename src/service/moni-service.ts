import axios, { AxiosError } from 'axios';

interface MoniLink {
  url: string;
  logoUrl: string;
  type: string;
  name: string;
}

interface MoniTag {
  name: string;
}

interface MoniTwitterInfo {
  twitterUserId: string;
  name: string;
  username: string;
  description: string;
  twitterCreatedAt: string;
  tweetCount: number;
  smartFollowersCount: number;
  followersCount: number;
  followersScore: number;
  mentionsCount: number;
  smartMentionsCount: number;
  profileImageUrl: string;
  profileBannerUrl: string;
  links: MoniLink[];
  tags: MoniTag[];
  chains: { name: string }[];
}

class MoniApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'MoniApiError';
  }
}

export class MoniService {
  constructor(
    private apiKey: string = process.env.MONI_API_KEY!,
    private baseUrl: string = 'https://api.discover.getmoni.io/api/v1'
  ) {
    if (!this.apiKey) {
      throw new Error('Moni API key is required');
    }
  }

  async getTwitterInfo(username: string): Promise<MoniTwitterInfo> {
    try {
      const response = await axios.get<MoniTwitterInfo>(
        `${this.baseUrl}/twitters/${username}/info`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          // API responded with error
          throw new MoniApiError(
            `Moni API error: ${error.response.data?.message || error.message}`,
            error.response.status,
            error
          );
        } else if (error.request) {
          // No response received
          throw new MoniApiError(
            'No response received from Moni API',
            undefined,
            error
          );
        }
      }
      // Generic error handling
      throw new MoniApiError(
        'Failed to fetch Twitter info from Moni',
        undefined,
        error
      );
    }
  }

  // Optional: Add validation method
  private validateTwitterInfo(data: any): asserts data is MoniTwitterInfo {
    const required = ['username', 'followersCount', 'followersScore', 'mentionsCount'];
    for (const field of required) {
      if (!(field in data)) {
        throw new MoniApiError(`Missing required field: ${field}`);
      }
    }
  }
}