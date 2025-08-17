import express from "express";
import dotenv from "dotenv";
import morgan from "morgan"; 
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import errorHandler from "./middlewares/errorHandler.middleware";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors());

app.use(morgan("dev"));

// Auth Route
app.use("/api/auth", authRoutes);

app.use(errorHandler);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`Server listening on ${port}`));
