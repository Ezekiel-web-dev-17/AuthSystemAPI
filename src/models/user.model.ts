import mongoose, { Document, model, Schema } from "mongoose";

interface UserModel extends Document {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

const userModel = new Schema<UserModel>(
  {
    firstname: {
      type: String,
      required: [true, "Your first name is required"],
      trim: true,
      minLength: 2,
      maxLength: 50,
    },
    lastname: {
      type: String,
      required: [true, "Your last name is required"],
      trim: true,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      type: String,
      required: [true, "Your email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: [true, "User Password is required"],
      minLength: 6,
    },
  },
  { timestamps: true }
);

export const User = model<UserModel>("User", userModel);
