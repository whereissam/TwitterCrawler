import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface MoniLink {
  url: string;
  logoUrl: string;
  type: string;
  name: string;
}

interface MoniTag {
  name: string;
  slug: string;
  color: string;
  hoverColor: string;
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
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = 'https://api.discover.getmoni.io/api/v1';
    this.apiKey = process.env.MONI_API_KEY!;

    if (!this.apiKey) {
      throw new Error('MONI_API_KEY is required in environment variables');
    }
  }

  async getTwitterInfo(username: string): Promise<MoniTwitterInfo> {
    try {
      const response = await axios.get<MoniTwitterInfo>(
        `${this.baseUrl}/twitters/${username}/info/`,
        {
          headers: {
            'accept': 'application/json',
            'Api-Key': this.apiKey
          }
        }
      );

      // Validate the response data
      this.validateTwitterInfo(response.data);
      
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          throw new MoniApiError(
            `Moni API error: ${error.response.data?.message || error.message}`,
            error.response.status,
            error
          );
        } else if (error.request) {
          throw new MoniApiError(
            'No response received from Moni API',
            undefined,
            error
          );
        }
      }
      throw new MoniApiError(
        'Failed to fetch Twitter info from Moni',
        undefined,
        error
      );
    }
  }

  private validateTwitterInfo(data: any): asserts data is MoniTwitterInfo {
    const required = ['username', 'followersCount', 'followersScore', 'mentionsCount'];
    for (const field of required) {
      if (!(field in data)) {
        throw new MoniApiError(`Missing required field: ${field}`);
      }
    }
  }
}