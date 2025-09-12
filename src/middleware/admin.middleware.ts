import { NextFunction, Response } from "express";
import { authorize, AuthRequest } from "./auth.middleware.js";

export const admin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  await new Promise((resolve, reject) => {
    authorize(req, res, (err) => {
      if (err) reject(err);
      else resolve(res);
    });
  }).catch(() => {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  });

  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied: Admins only",
    });
  }
};
