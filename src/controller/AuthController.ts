import 'reflect-metadata';
import IController from "../interfaces/IController";
import express, {NextFunction, Request, Response, Router} from "express";
import {StatusCodes} from "http-status-codes";
import AuthService from "../service/AuthService";
import {Container} from "typedi";
import LoginDto from "../dto/LoginDto";
import classValidation from "../middlewares/ClassValidation";
import ms from "ms";


export default class AuthController implements IController {
    path: string = '/auth';
    router: Router = express.Router();
    authService: AuthService;

    constructor() {
        this.authService = Container.get(AuthService);

        this.initRoutes();
    }

    private initRoutes() {
        this.router.post(`${this.path}/login`, classValidation(LoginDto), this.login);
    }

    private login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {email, password}: LoginDto = req.body;

            const {accessToken, refreshToken} = await this.authService.login(email, password);

            return res.status(StatusCodes.OK)
                .cookie("refresh-token", refreshToken, {
                    httpOnly: true,
                    maxAge: ms('0.5 y')
                }).json({token: accessToken});

        } catch (e) {
            next(e);
        }
    }


}
