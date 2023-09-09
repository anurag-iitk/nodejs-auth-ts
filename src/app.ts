import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import { createProxyMiddleware } from "http-proxy-middleware";


dotenv.config();
require("./config/init_user_mongodb");

const PORT = Number(process.env.USER_PORT) || 3000;
const AUTH_SERVER_URL = `http://localhost:${process.env.AUTH_PORT}`;

const app = express();
app.use(express.json());
app.use(errorHandler);

app.use('/auth', createProxyMiddleware({
    target: AUTH_SERVER_URL,
    changeOrigin: true, 
}));


app.listen(PORT, () => {
  console.log(`server starter on http://localhost:${PORT}`);
});
