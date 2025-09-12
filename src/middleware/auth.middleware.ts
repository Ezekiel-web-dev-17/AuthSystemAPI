import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "../config/app.config.js";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { User, UserModel } from "../models/user.model.js";

interface TokenPayload extends JwtPayload {
  userId: string;
}

export interface AuthRequest extends Request {
  user?: UserModel;
}

const accessTokenReq = (res: Response) => {
  return res.status(401).json({
    success: false,
    message: "Access token required.",
  });
};

export const authorize = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return accessTokenReq(res);
    }

    try {
      const decodeToken = jwt.verify(
        token,
        JWT_SECRET as Secret
      ) as TokenPayload;

      if (!decodeToken) {
        return accessTokenReq(res);
      }

      const user = await User.findById(decodeToken.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token - user not found.",
        });
      }

      req.user = user;
      return next();
    } catch (jwtError: any) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired. Please login again.",
          expiredAt: jwtError.expiredAt,
        });
      }

      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token format or signature.",
        });
      }

      if (jwtError.name === "NotBeforeError") {
        return res.status(401).json({
          success: false,
          message: "Token not active yet.",
        });
      }

      throw jwtError;
    }
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
      error: error.message,
    });
  }
};
