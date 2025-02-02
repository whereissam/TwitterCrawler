import { eq } from "drizzle-orm";
import db from "../db/db.js";
import { 
  users, products, influencers,
  User, NewUser, Product, Influencer 
} from "../db/schema.js";
import { MoniService } from './moni-service.js';

interface UserInput {
  username: string;
  id: string;  // Changed to string since it comes from frontend
  type: 'product' | 'influencer';
}
// Update the create function
export const create = async (input: UserInput): Promise<User> => {
  const moniService = new MoniService();

  return await db().transaction(async (tx) => {
    // Get Moni data first
    const twitterInfo = await moniService.getTwitterInfo(input.username);

    // Create user with just identity fields
    const [user] = await tx.insert(users).values({
      id: input.id,
      username: input.username,
      type: input.type,
      followersScore: twitterInfo.followersScore.toString()
    }).returning();

    if (!user) {
      throw new Error('User creation failed');
    }

    // Create initial snapshot with the metrics
    if (input.type === 'product') {
      await tx.insert(products).values({
        username: input.username,
        user_id: input.id,
        followersCount: Number(twitterInfo.followersCount),
        followersScore: twitterInfo.followersScore.toString(),
        mentionsCount: Number(twitterInfo.mentionsCount)
      });
    } else {
      await tx.insert(influencers).values({
        username: input.username,
        user_id: input.id,
        followersScore: twitterInfo.followersScore.toString()
      });
    }

    return user;
  });
};
export const findAll = async (): Promise<User[]> => {
  return await db().select().from(users);
};

export const findByUsername = async (username: string): Promise<User | undefined> => {
  const results = await db()
    .select()
    .from(users)
    .where(eq(users.username, username));
  return results[0];
};

export const findMetricsByUsername = async (username: string): Promise<Product | Influencer | undefined> => {
  const user = await findByUsername(username);
  if (!user) return undefined;

  if (user.type === 'product') {
    const results = await db()
      .select()
      .from(products)
      .where(eq(products.username, username));
    return results[0];
  } else {
    const results = await db()
      .select()
      .from(influencers)
      .where(eq(influencers.username, username));
    return results[0];
  }
};