// src/types/account.ts

// Base type for user registration
export interface RawUser {
  username: string;
  type: "product" | "influencer";
}

// Extended type with system fields
export interface User extends RawUser {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// Product metrics from Moni
export interface ProductMetrics {
  userId: number;
  followersCount: number;
  followersScore: number;
  mentionsCount: number;
}

// Influencer metrics from Moni
export interface InfluencerMetrics {
  userId: number;
  followersScore: number;
}

// Moni API response interface (for internal use)
export interface MoniTwitterInfo {
  twitterUserId: string;
  followersCount: number;
  followersScore: number;
  mentionsCount: number;
  smartFollowersCount: number;
  smartMentionsCount: number;
}