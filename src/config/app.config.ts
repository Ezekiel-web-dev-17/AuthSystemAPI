import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const {
  PORT,
  NODE_ENV,
  BASE_URL,
  MONGO_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  ARCJET_KEY,
  ARCJET_ENV,
  MAIL_USER,
  MAIL_HOST,
  MAIL_PORT,
} = process.env;
