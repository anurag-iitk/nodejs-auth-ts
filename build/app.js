"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
require("./config/init_mongodb");
const app = (0, express_1.default)();
const PORT = Number(process.env.AUTH_URL) || 3000;
app.listen(PORT, () => {
    console.log(`server starter on http://localhost:${PORT}`);
});
