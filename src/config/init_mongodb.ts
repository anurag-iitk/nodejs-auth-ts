import mongoose from "mongoose";
import dotenv from 'dotenv';
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '../.env')});

const DB_URL = process.env.DB_URL;

if(!DB_URL){
    console.log("environment varibale not defined");
    process.exit(1);
}

mongoose
  .connect(DB_URL)
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => {
    console.log(err);
  });

mongoose.connection.on("connected", () => {
  console.log("mongodb connected to db");
});

mongoose.connection.on("error", (err) => {
  console.log("error while connected with db", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("mongodb disconnected to db");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
