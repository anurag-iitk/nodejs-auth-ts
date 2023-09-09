import { NextFunction, Request, Response } from "express";
import { User } from "../models/user";
import { generateToken } from "../utils/jwt_helper";
import CustomError from "../../../utils/error";
import { collections } from "../config/db_conn";
import bcrypt from 'bcrypt';

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
      password:hashPassword,
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
    res.status(201).json({ token, user: newUser });
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
    res.status(200).send({ token, user });
  } catch (err) {
    next(new CustomError(err || "Login failed", 500));
  }
};
