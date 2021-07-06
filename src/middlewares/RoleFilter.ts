import {RequestHandler} from "express";
import {UnauthenticatedException, UnauthorizedException} from "../exception/HttpException";
import httpContext from "express-http-context";
import Role from "../models/Role";

export default function preAuthorize(roleName: Role[] = undefined): RequestHandler {
    return (req, res, next) => {
        const credentials = httpContext.get('credential');

        // if not logged-in
        if (!credentials) {
            next(new UnauthenticatedException());
        }

        const {role} = credentials;
        // if there is specified role to check
        if (roleName && roleName.length > 0) {
            if (roleName.indexOf(role) != -1) {
                next();
            } else
                next(new UnauthorizedException());
        }

        next();
    };
}
