import express from "express";
import dotenv from "dotenv";
import morgan from "morgan"; 
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import eventRoutes from "./routes/event.routes";
import errorHandler from "./middlewares/errorHandler.middleware";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(morgan("dev"));

// Auth Route
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/event", eventRoutes);

// Unhandle Error
app.use(errorHandler);

// Server Listining
const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`Server listening on ${port}`));
