import {RequestHandler} from "express";
import {validate, ValidationError} from "class-validator";
import {plainToClass} from "class-transformer";
import HttpException from "../exception/HttpException";

function classValidation<T>(type: any, skipMissingProperties = false): RequestHandler {
    return (req, res, next) => {
        validate(plainToClass(type, req.body), {skipMissingProperties: skipMissingProperties})
            .then((errors: ValidationError[]) => {
                if (errors.length > 0) {
                    const message = errors.map((e) => Object.values(e.constraints ?? '')).join(', ');
                    next(new HttpException(400, message));
                } else {
                    next();
                }
            });
    };
}

export default classValidation;
