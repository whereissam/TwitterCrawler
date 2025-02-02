import dotenv from "dotenv";

dotenv.config();

interface Env {
  PORT: number;
  DB_URL: string;
  TWITTER_USERNAME: string;
}

const config = (): Env => {
  return {
    PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
    DB_URL: process.env.DB_URL ? process.env.DB_URL : "value_not_provided",
    TWITTER_USERNAME: process.env.TWITTER_USERNAME || '@alephium',
  };
};

export default config;
