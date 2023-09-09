import mongoose from "mongoose";
import dotenv from 'dotenv';
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '../.env')});

const DB_URL = process.env.USER_DB_URL;

if(!DB_URL){
    console.log("environment varibale not user defined");
    process.exit(1);
}

mongoose
  .connect(DB_URL)
  .then(() => {
    console.log("mongodb connected with user db");
  })
  .catch((err) => {
    console.log(err);
  });

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
