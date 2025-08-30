import { NextFunction, Request, Response } from "express";

interface Error {
  name: string;
  code: number;
  statusCode?: number;
  message: string | string[];
  errors: [];
}

// let message: string | string[];

const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let error: Error = { ...err };

    error.message = err.message;

    console.error(err);

    // Mongoose bad objectId
    if (err.name === "CastError") {
      const message = "Resource not found";
      if (!error) error = {} as Error;
      error.message = message;
      error.statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
      const message = "Duplicate field value entered";
      error.message = message;
      err.statusCode = 400;
    }

    // Mongoose Validation Error
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((val) => val.message);
      error.message = message.join(", ");
      error.statusCode = 400;
    }

    res
      .status(error.statusCode || 500)
      .json({ success: false, error: error.message || "Server error." });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
