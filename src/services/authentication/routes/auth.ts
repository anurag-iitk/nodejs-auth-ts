import express  from "express";
import * as AuthController from "../controllers/auth";
const router = express.Router();


router.post('/signup', AuthController.signUp);
router.post('/login', AuthController.logIn);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.post('/update-password', AuthController.updatePassword);
router.post('/forgot-password', AuthController.forgotPassword);



export default router;