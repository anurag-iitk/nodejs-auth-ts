import { NextFunction, Request, Response } from "express";
import { User } from "../models/user";
import {
  generateToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt_helper";
import CustomError from "../../../utils/error";
import { collections } from "../config/db_conn";
import bcrypt from "bcrypt";

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
