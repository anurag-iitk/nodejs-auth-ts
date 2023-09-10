import path from "path";
import express, { Response, Request, NextFunction } from "express";
import dotenv from "dotenv";
import { errorHandler } from "./src/middleware/errorHandler";
import { connectToDatabase } from "./src/config/db_conn";
import cors from "cors";
import authRouter from "./src/routes/auth";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const PORT = process.env.AUTH_PORT || 6000;
const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send({ json: "this is auth index page" });
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(errorHandler);

connectToDatabase()
  .then(() => {
    app.use("/auth", authRouter);

    app.listen(PORT, () => {
      console.log(`Server started at http://localhost:${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error("Database connection failed", error);
    process.exit();
  });
