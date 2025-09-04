import { Router } from "express";
import { verifyEmail } from "../controllers/verify.controller.js";

const verifyRouter = Router();

verifyRouter.get("/", verifyEmail);

export default verifyRouter;
