import { Router } from "express";
import { logIn, signUp } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/signUp", signUp);
authRouter.post("/login", logIn);

export default authRouter;
