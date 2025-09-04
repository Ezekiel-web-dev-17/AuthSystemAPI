import express, { Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import errorMiddleware from "./middleware/error.middleware.js";
import { connectDB } from "./Database/DBConnect.js";
import { PORT } from "./config/app.config.js";
import authRouter from "./routes/auth.route.js";
import verifyRouter from "./routes/verify.route.js";

const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));
app.use(cors());

app.get("/", (req: Request, res: Response) => res.send("API is running..."));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/verify-email", verifyRouter);

app.use(errorMiddleware);

const hostname = "0.0.0.0";
const port = Number(PORT) || 4000;
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, hostname, () => {
      console.log(`✅ Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
