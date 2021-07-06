import {NextFunction, Request, Response} from "express";
import {Container} from "typedi";
import JwtService from "../service/JwtService";
import httpContext from "express-http-context";
import IUserCredential from "../interfaces/IUserCredential";

const jwtService = Container.get(JwtService);

export default function jwtFilterMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.get('Authorization');
    try {
        if (authHeader && authHeader.startsWith("Bearer")) {
            const accessToken = authHeader.replace("Bearer ", "");
            if (jwtService.isValidJwt(accessToken)) {
                const credential: IUserCredential = jwtService.getPayLoad(accessToken);
                httpContext.set('credential', credential);
            }
        }
        next();
    } catch (e) {
        next(e);
    }
}