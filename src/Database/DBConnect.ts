import { MONGO_URI, NODE_ENV } from "../config/app.config.js";
import mongoose from "mongoose";

if (!MONGO_URI)
  throw new Error(
    `MONGO_URI is not defined in ${NODE_ENV} environment variables`
  );

export const connectDB = async () => {
  try {
    if (MONGO_URI) {
      await mongoose.connect(MONGO_URI);
      console.log("Server connected MongoDB!");
      process.exit(0);
    }
  } catch (error) {
    console.log("Error connecting to database", error);
    process.exit(1);
  }
};
