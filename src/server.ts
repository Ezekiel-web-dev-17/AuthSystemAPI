import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import errorMiddleware from "./middleware/error.middleware.js";
import { connectDB } from "./Database/DBConnect.js";
import { PORT } from "./config/app.config.js";
import authRouter from "./routes/auth.js";

const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));
app.use(cors());

app.use("/api/v1/auth", authRouter);

app.use(errorMiddleware);

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port 3000 ${PORT}`);
});
