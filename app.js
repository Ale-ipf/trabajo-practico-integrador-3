import express from "express";
import cookieParser from "cookie-parser";
import { startDB } from "./src/config/database.js";
import dotenv from "dotenv";
import "dotenv/config";
import { userRouter } from "./src/routes/user.routes.js";
import { eventRouter } from "./src/routes/events.routes.js";
import { categoryRouter } from "./src/routes/category.routes.js";
import { authRouter } from "./src/routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", userRouter);
app.use("/api", authRouter);
app.use("/api", eventRouter);
app.use("/api", categoryRouter);

app.listen(PORT, async () => {
  await startDB();
  console.log(`Servidor listo en puerto ${PORT}`);
});
