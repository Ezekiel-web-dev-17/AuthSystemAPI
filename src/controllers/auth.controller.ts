import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

interface UserInfo extends Document {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

interface RespJSON {
  success: boolean;
  message?: string;
  data?: Pick<UserInfo, "firstname" | "lastname" | "email" | "password">;
}

export const signUp = async (
  req: Request<{}, {}, UserInfo>,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();

  session.startTransaction();
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password)
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });

    const existingUser = await User.findOne({ email });

    const existingUserRes: RespJSON = {
      success: false,
      message: "User already exists.",
    };
    if (existingUser) return res.status(401).json(existingUserRes);

    const passSalt = await bcrypt.genSalt(12);

    const hashedPassword = bcrypt.hash(password, passSalt);

    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    await session.commitTransaction();
    await session.endSession();

    const successRes: RespJSON = {
      success: true,
      message: "User signed up successfully",
      data: newUser,
    };
    res.status(201).json(successRes);
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    next(error);
  }
};
