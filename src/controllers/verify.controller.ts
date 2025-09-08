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

/*
export const forgotPass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    // 1) generate and store a token (save hash + expiry in DB!)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const resetUrl = `${BASE_URL}/reset-password?token=${encodeURIComponent(
      rawToken
    )}&userId=${user._id}`;

    // store hashed token + userId + expiresAt in your DB
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
    const RESET_TOKEN_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    await EmailVerification.create({
      userId: user._id,
      tokenHash: hashed,
      expiresAt, // 10 minutes from now
    });

    // send email
    if (!MAIL_HOST || !MAIL_USER || !MAIL_PORT) {
      throw new Error(
        `Missing email configuration. Check your ${NODE_ENV} environment variables.`
      );
    }

    const transportPayload: TransportOptions = {
      host: MAIL_HOST,
      port: Number(MAIL_PORT),
      secure: true,
      auth: {
        user: MAIL_USER,
        pass: process.env.MAIL_PASS!,
      },
    };
    const transporter: nodemailer.Transporter =
      nodemailer.createTransport(transportPayload);

    const text = `Hi ${user.firstname},

You requested a password reset. Please use the link below to set a new password: ${resetUrl}

If you didn’t request this, ignore this message.
— AuthSystemApi`;

    const html = `<p>Hi ${user.firstname},</p>
<p>You requested a password reset. Please use the link below to set a new password:</p>
<p><a href="${resetUrl}">Reset Password</a></p>
<p>If you didn’t request this, ignore this message.</p>
<p>— AuthSystemApi</p>`;

    try {
      // Verify connection
      await transporter.verify();
      console.log("✅ Email transporter verified successfully");
    } catch (error: any) {
      console.error("❌ Failed to initialize email transporter:", error);
      return res.status(503).json({
        success: false,
        message: `Email service unavailable: ${error.message}`,
      });
    }

    try {
      // Send email
      const info = await transporter.sendMail({
        from: `"AuthSystemApi" <${MAIL_USER}>`,
        to: user.email,
        subject: "Password Reset",
        text,
        html,
      });

      console.log("✅ Password reset email sent: ", info.messageId);
      return res.status(200).json({
        success: true,
        message: "Password reset email sent successfully!",
      });
    } catch (error: any) {
      console.error("❌ Failed to send password reset email: ", error);
      return res.status(500).json({
        success: false,
        message: `Failed to send password reset email: ${error.message}`,
      });
    }
  } catch (error) {
    next(error);
  }
};
export const resetPass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, userId, newPassword } = req.body;
    if (!token || !userId || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token, userId, and new password are required!",
      });
    }

    // hash the received token
    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    // find a matching token in DB that is not expired
    const record = await EmailVerification.findOne({
      userId,
      tokenHash: hashed,
      expiresAt: { $gt: new Date() }, // not expired
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token!",
      });
    }

    // valid token - update user's password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });

    // delete all tokens for this user
    await EmailVerification.deleteMany({ userId });

    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully!" });
  } catch (error) {
    next(error);
  }
};
*/
