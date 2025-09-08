import { Router } from "express";
import {
  forgotPassword,
  logIn,
  refreshToken,
  resetPassword,
  signUp,
} from "../controllers/auth.controller.js";
import arcjetMiddleware from "../middleware/arcjet.middleware.js";

const authRouter = Router();

authRouter.post("/signUp", signUp);
authRouter.post("/login", arcjetMiddleware, logIn);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/refresh-token", refreshToken);
export default authRouter;
