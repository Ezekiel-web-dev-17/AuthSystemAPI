import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { EmailVerification } from "../models/verified.model.js";
import { User } from "../models/user.model.js";

export const verifyEmail = async (
  req: Request<{}, {}, {}, { token: string; userId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, userId } = req.query;

    if (!token || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Token and userId are required." });
    }

    // 1) hash the token from the request
    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    // 2) find a matching record in the DB
    const record = await EmailVerification.findOne({
      userId,
      tokenHash: hashed,
      expiresAt: { $gt: new Date() }, // check if not expired
    });

    if (!record) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token." });
    }

    // 3) mark user's email as verified (you need to implement this in your User model)
    await User.findByIdAndUpdate(userId, { isEmailVerified: true });

    // 4) delete the verification record
    await EmailVerification.deleteOne({ _id: record._id });

    res
      .status(200)
      .json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    next(error);
  }
};
