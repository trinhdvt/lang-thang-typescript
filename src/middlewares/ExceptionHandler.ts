import {Request, Response, NextFunction} from "express";
import HttpException from "../exception/HttpException";

function exceptionHandler(error: HttpException, req: Request, res: Response, next: NextFunction) {
    const status: number = error.status || 500;
    const message: string = error.message || "Server error";

    res.status(status).json({
        status, message
    });
}

export default exceptionHandler;