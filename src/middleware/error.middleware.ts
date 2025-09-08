import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

interface AppError extends Error {
  code?: number;
  statusCode?: number;
  errors?: any;
}

const errorMiddleware = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error = { ...err };

  error.message = err.message || "Something went wrong";

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error.message = "Resource not found";
    error.statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error.message = "Duplicate field value entered";
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    error.message = Object.values(
      (err as mongoose.Error.ValidationError).errors
    )
      .map((val: any) => val.message)
      .join(", ");
    error.statusCode = 400;
  }

  // Log (only stack in dev)
  if (process.env.NODE_ENV !== "production") {
    console.error("🔥 Error:", err);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorMiddleware;
