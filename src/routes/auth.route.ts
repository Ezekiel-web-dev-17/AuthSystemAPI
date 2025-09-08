import { Router } from "express";
import {
  forgotPassword,
  logIn,
  resetPassword,
  signUp,
} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/signUp", signUp);
authRouter.post("/login", logIn);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
export default authRouter;
