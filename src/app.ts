import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
require("./config/init_mongodb");

const PORT = Number(process.env.AUTH_URL) || 3000;
const app = express();


app.listen(PORT, ()=> {
    console.log(`server starter on http://localhost:${PORT}`)
})