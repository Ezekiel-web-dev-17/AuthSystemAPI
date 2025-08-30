import { Router } from "express";

const authRouter = Router();

authRouter.post("/signUp", signUp);
authRouter.post("/signIn", signIn);

export default authRouter;
