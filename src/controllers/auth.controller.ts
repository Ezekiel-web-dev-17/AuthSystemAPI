import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import {
  FORGOT_PASSWORD_URL,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  NODE_ENV,
  VERIFY_EMAIL_URL,
} from "../config/app.config.js";
import { emailTemplate } from "../helper/emailTemplate.js";
import { EmailVerification } from "../models/verified.model.js";
import { forgotPasswordTemplate } from "../helper/fogotPassword.js";

interface UserInfo {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

interface LoginInfo {
  email: string;
  password: string;
}

interface JwtPayload {
  userId: string;
}

interface TransportOptions {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// build a user-specific verify URL (example)
function buildVerifyUrl(baseUrl: string, token: string, userId: string) {
  return `${baseUrl}?token=${encodeURIComponent(token)}&userId=${userId}`;
}

const EMAIL_HTML_TEMPLATE = emailTemplate;

// tiny helper to fill placeholders
function renderVerifyEmailHtml(params: {
  firstName: string;
  verifyUrl: string;
  appName: string;
}) {
  const { firstName, verifyUrl, appName } = params;
  return EMAIL_HTML_TEMPLATE.replaceAll("{{FIRST_NAME}}", firstName)
    .replaceAll("{{VERIFY_URL}}", verifyUrl)
    .replaceAll("{{APP_NAME}}", appName);
}

function renderForgotPasswordEmailHtml(params: {
  firstName: string;
  reset_link: string;
  app_name: string;
}) {
  const { firstName, reset_link, app_name } = params;
  return forgotPasswordTemplate
    .replaceAll("{{name}}", firstName)
    .replaceAll("{{reset_link}}", reset_link)
    .replaceAll("{{app_name}}", app_name)
    .replaceAll("{{expiry_hours}}", "15m")
    .replaceAll("{{support_email}}", MAIL_USER || "<support_email>")
    .replaceAll("{{current_year}}", `${new Date().getFullYear()}`);
}

export async function sendMail(opts: {
  to: string;
  firstName: string;
  appName?: string;
  baseUrl: string;
  userId: string;
}) {
  const { to, firstName, baseUrl, appName, userId } = opts;

  // 1) generate and store a token (save hash + expiry in DB!)
  const rawToken = crypto.randomBytes(32).toString("hex");
  const verifyUrl = buildVerifyUrl(baseUrl, rawToken, userId);

  // store hashed token + userId + expiresAt in your DB
  const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
  const EMAIL_TOKEN_EXPIRY_MS = 15 * 60 * 1000;

  const expiresAt = new Date(Date.now() + EMAIL_TOKEN_EXPIRY_MS);

  await EmailVerification.deleteMany({ userId });

  await EmailVerification.create({
    userId,
    tokenHash: hashed,
    expiresAt, // 5 minute from now
  });

  // 2) create transporter (Mailtrap live SMTP w/ token)
  if (!MAIL_HOST || !MAIL_USER || !MAIL_PORT) {
    throw new Error(
      `Missing email configuration. Check your ${NODE_ENV} environment variables.`
    );
  }

  if (!process.env.MAIL_PASS) throw new Error("MAIL_PASS is missing!");

  const transportPayload: TransportOptions = {
    host: MAIL_HOST,
    port: Number(MAIL_PORT),
    secure: Number(MAIL_PORT) === 465,
    auth: {
      user: MAIL_USER,
      pass: process.env.MAIL_PASS!,
    },
  };
  const transporter: nodemailer.Transporter =
    nodemailer.createTransport(transportPayload);

  // 3) compose safe text fallback + HTML
  const text = `Hi ${firstName},

Congrats for sending test email with Mailtrap + Nodemailer + TS 🚀
Please verify your email: ${verifyUrl}

If you didn’t request this, ignore this message.
— ${appName}`;

  const forgotPassText = `Subject: AuthSystemApi password reset — link expires in 15 minutes

Hi ${firstName},

We received a request to reset the password for your AuthSystemApi account. Use the link below to set a new password. This link expires in 15 minutes.

Reset password: ${verifyUrl}

If you didn't request this change, you can ignore this email or contact us at ${
    MAIL_USER || "<support_email>"
  }.

Important: Never share your password or the reset link with anyone.

— The AuthSystemApi team
`;
  const html = renderVerifyEmailHtml({
    firstName,
    verifyUrl,
    appName: appName || "AuthSystemApi",
  });

  try {
    // Verify connection
    await transporter.verify();
    console.log("✅ Email transporter verified successfully");
  } catch (error: any) {
    console.error("❌ Failed to initialize email transporter:", error);
    return {
      success: false,
      error: `Email service unavailable: ${error.message}`,
    };
  }

  try {
    // Send email
    const info = await transporter.sendMail({
      from: `"${appName}" noreply@authsystemapi.dev`,
      to,
      subject: baseUrl.includes("reset-password")
        ? "Reset your password"
        : "Verify your email",
      text: baseUrl.includes("reset-password") ? forgotPassText : text, // plaintext for clients that block HTML
      html: baseUrl.includes("reset-password")
        ? renderForgotPasswordEmailHtml({
            firstName,
            reset_link: verifyUrl,
            app_name: appName || "AuthSystemApi",
          })
        : html,
    });

    return {
      success: true,
      messageId: info.messageId,
      rawToken: NODE_ENV === "development" ? rawToken : undefined,
    }; // send rawToken back if you verify immediately in tests
  } catch (error: any) {
    console.error("❌ Failed to send email:", error);
    return {
      success: false,
      error: `Failed to send email: ${error.message}`,
    };
  }
}

export const signUp = async (
  req: Request<{}, {}, UserInfo>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(401)
        .json({ success: false, message: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    const passToSendMail = {
      to: email,
      firstName: firstname,
      appName: "AuthSystemApi",
      baseUrl: VERIFY_EMAIL_URL!,
      userId: `${newUser._id}`,
    };

    let token;
    // send login notification email
    try {
      const emailResult = await sendMail(passToSendMail);
      if (!emailResult.success) {
        return res.status(500).json({
          success: false,
          message: `❌ Failed to send verification email: ${emailResult.error}`,
        });
        // Decide: fail signup or continue with warning
      }

      const { rawToken } = emailResult;

      token = rawToken;
    } catch (error) {
      return next(error);
    }

    const safeUser = {
      id: newUser._id,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      email: newUser.email,
    };

    res.status(201).json({
      success: true,
      message: "User signed up successfully",
      data: safeUser,
      token: NODE_ENV === "development" ? token : "************",
    });
  } catch (error) {
    next(error);
  }
};

export const logIn = async (
  req: Request<{}, {}, LoginInfo>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });

    if (!user.isEmailVerified)
      return res
        .status(403)
        .json({ success: false, message: "Your Email is not verified!" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res
        .status(401)
        .json({ success: false, message: "Incorrect Password!" });

    if (!JWT_SECRET) {
      try {
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      } catch (error) {
        next(error);
      }
    }

    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET as Secret, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET as Secret,
      { expiresIn: "5d" }
    );

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request<{}, {}, { email: string }>,
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

    const emailResult = await sendMail({
      to: email,
      firstName: user.firstname,
      appName: "AuthSystemApi",
      baseUrl: FORGOT_PASSWORD_URL!,
      userId: `${user._id}`,
    });

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
      // only in dev mode
      rawToken: emailResult.rawToken,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request<
    {},
    {},
    { newPassword: string },
    { token: string; userId: string }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { newPassword } = req.body;
    const { token, userId } = req.query;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required!",
      });
    }

    if (!token || !userId)
      return res.status(400).json({
        success: false,
        message: "Token and userId are required",
      });

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const verifyToken = await EmailVerification.findOne({ tokenHash: hashed });

    if (!verifyToken || verifyToken.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "This token is expired or invalid.",
      });
    }

    await EmailVerification.deleteMany({ userId });

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await User.findOneAndUpdate(
      { _id: userId },
      { password: hashedNewPassword }
    );

    res.status(200).json({
      success: true,
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};
export const refreshToken = async (
  req: Request<{}, {}, { token: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "The refresh token is required.",
      });
    }

    // ✅ Verify signature and payload
    const decoded = jwt.verify(
      token,
      JWT_REFRESH_SECRET as Secret
    ) as jwt.JwtPayload & { userId: string };

    const { userId, exp } = decoded;
    if (!userId || !exp) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token." });
    }

    // ✅ Check expiration properly (seconds vs ms)
    if (exp < Math.floor(Date.now() / 1000)) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token has expired." });
    }

    // ✅ Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    if (!user.isEmailVerified) {
      return res
        .status(403)
        .json({ success: false, message: "User email not verified!" });
    }

    // ✅ Issue new access token
    const accessToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET as Secret,
      { expiresIn: "15m" } // short lifespan for access token
    );

    // (Optional) Issue a new refresh token too:
    const newRefreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET as Secret,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken, // if rotating tokens
    });
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired refresh token." });
  }
};
