import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV}.local` });

export const {
  PORT,
  NODE_ENV,
  MONGO_URI,
  JWT_SECRET,
  JWT_EXPIRE,
  ARCJET_KEY,
  ARCJET_ENV,
} = process.env;
