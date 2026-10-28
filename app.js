import express from "express";
import { startDB } from "./src/config/database.js";
import dotenv from "dotenv";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// Routes

app.listen(PORT, async () => {
  await startDB();
  console.log(`Servidor listo en puerto ${PORT}`);
});
