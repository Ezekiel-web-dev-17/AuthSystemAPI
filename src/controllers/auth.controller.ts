import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import {
  BASE_URL,
  JWT_SECRET,
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  NODE_ENV,
} from "../config/app.config.js";
import { emailTemplate } from "../helper/emailTemplate.js";
import { EmailVerification } from "../models/verified.model.js";

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
  return `${baseUrl}/api/v1/verify-email?token=${encodeURIComponent(
    token
  )}&userId=${userId}`;
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
  const EMAIL_TOKEN_EXPIRY_MS = 5 * 60 * 1000;

  const expiresAt = new Date(Date.now() + EMAIL_TOKEN_EXPIRY_MS);

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

  // 3) compose safe text fallback + HTML
  const text = `Hi ${firstName},

Congrats for sending test email with Mailtrap + Nodemailer + TS 🚀
Please verify your email: ${verifyUrl}

If you didn’t request this, ignore this message.
— ${appName}`;

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
      from: `"${appName}" <noreply@yourdomain.dev>`,
      to,
      subject: "Verify your email",
      text, // plaintext for clients that block HTML
      html,
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
      baseUrl: BASE_URL!,
      userId: `${newUser._id}`,
    };

    let token;
    // send login notification email
    try {
      const emailResult = await sendMail(passToSendMail);
      if (!emailResult.success) {
        console.error(
          "❌ Failed to send verification email:",
          emailResult.error
        );
        // Decide: fail signup or continue with warning
      }

      const { rawToken } = emailResult;

      token = rawToken;
    } catch (error) {
      return console.error("❌ Error sending email:", error);
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
      token,
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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res
        .status(401)
        .json({ success: false, message: "Incorrect Password!" });

    if (!JWT_SECRET) {
      console.error("❌ JWT_SECRET is not defined");
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
    const token = jwt.sign({ userId: user.id } as JwtPayload, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
    });
  } catch (error) {
    next(error);
  }
};
