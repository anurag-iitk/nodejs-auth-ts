import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();
require("./config/init_mongodb");

const PORT = Number(process.env.AUTH_URL) || 3000;
const app = express();

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`server starter on http://localhost:${PORT}`);
});
