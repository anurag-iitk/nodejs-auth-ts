import path from "path";
import JwT from "jsonwebtoken";
import CustomError from "./error";
import dotenv from "dotenv";
import { NextFunction } from "express";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

interface IPayload {
  id: string;
  role?: string;
  subRole?: string;
  aud?: string;
}

export const generateToken = (id: any, role?: string, subRole?: string) => {
  return new Promise((resolve, reject) => {
    const payload: IPayload = { id, role };
    if (subRole) {
      payload.subRole = subRole;
    }
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const options = {
      expiresIn: "1h",
      issuer: "ehr.com",
      audience: id,
    };
    JwT.sign(payload, secret!, options, (err, token) => {
      if (err)
        reject(
          new CustomError(
            "authentication token failed to generate access token",
            500
          )
        );
      resolve(token);
    });
  });
};

export const verifyAccessToken = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.headers.get("authorization"))
      return next(new CustomError("User not authorized to access", 400));

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token || token.length <= 0) {
      return next(new CustomError("Invalid authorization format", 400));
    }

    JwT.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET! as string,
      (err: any, payload: any) => {
        if (err) {
          const msg =
            err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
          return next(new CustomError(msg, 400));
        }
        req.payload = payload;
        next();
      }
    );
  } catch (err) {
    next(new CustomError(err, 500));
  }
};

export const signRefreshToken = (id: any) => {
  return new Promise((resolve, reject) => {
    const payload = {}
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const options = {
      expiresIn: "1y",
      issuer: "ehr.com",
      audience: id,
    };
    JwT.sign(payload, secret!, options, (err, token) => {
      if(err) reject(new CustomError("Error while sign refresh token", 400))
      resolve(token)
    });
  });
};


export const verifyRefreshToken = (refreshToken: string) => {
  return new Promise((resolve, reject) => {
    JwT.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET!, (err, decodedPayload) => {
      if(err) reject(new CustomError("Error while verifying refresh token", 400))
      
      if(typeof decodedPayload !== 'string' && decodedPayload?.aud) {
        const userId = decodedPayload.aud;
        resolve(userId);
      } else {
        reject(new CustomError("Invalid refresh token payload", 400));
      }
    })
  })
}
