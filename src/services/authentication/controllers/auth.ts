import { NextFunction, Request, Response } from "express";
import {
  generateToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt_helper";
import CustomError from "../../../utils/error";
import { collections } from "../config/db_conn";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name, role, subRole } = req.body;
    if (!email || !password || !name || !role) {
      throw new CustomError("Missing required fields", 400);
    }
    if (role == "doctor") {
      if (!subRole)
        throw new CustomError("Missing doctor sub role required fields", 400);
    }

    const existinguser = await collections.users!.findOne({ email });
    if (existinguser) {
      throw new CustomError("Email already exist", 400);
    }

    const userCount = await collections.users!.countDocuments();
    const userId = `user${userCount + 1}`;
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: userId,
      email,
      password: hashPassword,
      name,
      role,
      subRole,
    };
    await collections.users!.insertOne(newUser);
    const token = await generateToken(
      newUser.id,
      newUser.role,
      newUser.subRole
    );
    const refreshToken = await signRefreshToken(newUser.id);
    res.status(201).json({
      token,
      refreshToken,
      user: { userId: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    next(new CustomError(err, 400));
  }
};

export const logIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      throw new CustomError("Email and Password are required", 400);

    const user = await collections.users!.findOne({ email });
    if (!user) throw new CustomError("No user found with this email", 400);

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      throw new CustomError("Incorrect password and username", 401);

    const token = await generateToken(user.id, user.role, user.subRole);
    const refreshToken = await signRefreshToken(user.id);
    res.status(200).send({ token, refreshToken, user });
  } catch (err) {
    next(new CustomError(err || "Login failed", 500));
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.headers.authorization?.split(" ")[1];
    if (!refreshToken)
      return next(new CustomError("Error while refresh token", 400));
    const userId = await verifyRefreshToken(refreshToken);
    const newAccessToken = await generateToken(userId);
    const newRefreshToken = await signRefreshToken(userId);
    res.send({ newAccessToken, newRefreshToken });
  } catch (error) {
    next(new CustomError(error, 400));
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.headers.authorization?.split(" ")[1];
    if (!refreshToken) throw new CustomError("token not found", 400);
    const userId = await verifyRefreshToken(refreshToken);
    res.sendStatus(204);
  } catch (error) {
    next(new CustomError(error, 400));
  }
};

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword) {
      throw new CustomError("All fields are required", 400);
    }

    const user = await collections.users!.findOne({ email });
    if (!user) throw new CustomError("User not found", 400);

    const isOldPasswordCorrect = await bcrypt.compare(
      oldPassword,
      user.password
    );
    if (!isOldPasswordCorrect)
      throw new CustomError("Old password is incorrect", 401);

    const hashNewPassword = await bcrypt.hash(newPassword, 10);
    await collections.users!.updateOne(
      { email },
      { $set: { password: hashNewPassword } }
    );

    res.status(200).send({ message: "Password updated successfully" });
  } catch (err) {
    next(new CustomError(err || "Password update failed", 500));
  }
};


export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) throw new CustomError("Email is required", 400);

    const user = await collections.users!.findOne({ email });
    if (!user) throw new CustomError("User not found", 400);

    const resetToken = Math.floor(Math.random() * 1000000).toString();
    await collections.users!.updateOne({ email }, { $set: { resetToken } });

    // Send an email with the reset token
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Token",
      text: `Your password reset token is: ${resetToken}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) throw err;
      res
        .status(200)
        .send({ message: "Reset token has been sent to your email." });
    });
  } catch (err) {
    next(new CustomError(err || "Failed to send reset token", 500));
  }
};

