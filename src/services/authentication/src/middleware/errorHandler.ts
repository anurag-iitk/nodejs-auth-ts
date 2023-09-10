import { Request, Response, NextFunction } from "express";
import CustomError  from "../utils/error";

export const errorHandler = (err: any, req: Request, res:Response, next:NextFunction) => {
    if(err instanceof CustomError){
        return res.status(err.statusCode).send({error: err.message});
    }

    // log the error message for debugging purpose
    console.log(err.Stack);
    res.status(500).send({error: "An unknown error occurred!"})
};