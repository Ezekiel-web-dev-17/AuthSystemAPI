import { model, Schema } from "mongoose";

const emailVerified = new Schema({
  userId: { type: String, required: true, unique: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

export const EmailVerification = model("EmailVerification", emailVerified);
