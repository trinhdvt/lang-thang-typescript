import IController from "../interfaces/IController";
import express, {NextFunction, Request, Response, Router} from "express";
import {StatusCodes} from "http-status-codes";
import AuthService from "../service/AuthService";
import {Container} from "typedi";
import LoginDto from "../dto/LoginDto";
import classValidation from "../middlewares/ClassValidation";
import ms from "ms";
import HttpException from "../exception/HttpException";
import RegisterDto from "../dto/RegisterDto";
import StringUtils from "../utils/StringUtils";


export default class AuthController implements IController {
    path: string = '/auth';
    router: Router = express.Router();
    authService: AuthService;

    constructor() {
        this.authService = Container.get(AuthService);

        this.initRoutes();
    }

    private initRoutes() {
        this.router.post(`/login`, classValidation(LoginDto), this.login);
        this.router.post(`/google`, this.loginWithGoogle);
        this.router.post(`/refreshToken`, this.refreshAccessToken)
        this.router.post(`/registration`, classValidation(RegisterDto), this.register);
        this.router.post(`/registrationConfirm`, this.registrationConfirm);
        this.router.post(`/resetPassword`, this.requestResetPwd);
        this.router.get(`/changePassword`, this.validatePwdResetToken);
        this.router.put(`/savePassword`, classValidation(RegisterDto, true), this.resetPassword);
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

    private loginWithGoogle = async (req: Request, res: Response, next: NextFunction) => {
        const googleToken = req.body['google_token'];
        if (!googleToken) {
            return next(new HttpException(StatusCodes.BAD_REQUEST, 'Google token is required'));
        }
        try {
            const token = await this.authService.loginWithGoogle(googleToken);
            if (token) {
                const {accessToken, refreshToken} = token;
                return res.status(StatusCodes.OK)
                    .cookie("refresh-token", refreshToken, {
                        httpOnly: true,
                        maxAge: ms('0.5 y')
                    }).json({token: accessToken});
            }
        } catch (e) {
            return next(e)
        }
    }

    private refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
        const refreshToken = req.cookies['refresh-token'] as string;
        const accessToken = req.get('Authorization');

        if (!accessToken || !accessToken?.startsWith("Bearer")) {
            return next(new HttpException(StatusCodes.FORBIDDEN, "Invalid Authorization header"));
        }
        if (!refreshToken) {
            return next(new HttpException(StatusCodes.BAD_REQUEST, "Empty refresh-token cookie"));
        }

        try {
            const newToken = await this.authService.reCreateToken(accessToken.substring(7), refreshToken);
            return res.status(StatusCodes.OK)
                .cookie("refresh-token", newToken.refreshToken, {
                    httpOnly: true,
                    maxAge: ms('0.5 y')
                }).json({token: newToken.accessToken});

        } catch (e) {
            return next(e);
        }

    };

    private register = async (req: Request, res: Response, next: NextFunction) => {
        const userData: RegisterDto = req.body;
        if (userData.password !== userData.matchedPassword) {
            return next(new HttpException(StatusCodes.BAD_REQUEST, "Password doesn't match"));
        }
        try {
            await this.authService.register(userData);
            return res.status(StatusCodes.ACCEPTED).send();
        } catch (e) {
            return next(e);
        }
    }

    private registrationConfirm = async (req: Request, res: Response, next: NextFunction) => {
        const {token} = req.body;
        if (!token) {
            return next(new HttpException(StatusCodes.BAD_REQUEST, "Missing token"));
        }

        try {
            await this.authService.activateAccount(token);
            return res.status(StatusCodes.ACCEPTED).send();
        } catch (e) {
            return next(e);
        }
    }

    private requestResetPwd = async (req: Request, res: Response, next: NextFunction) => {
        const {email} = req.body;
        if (!email || !StringUtils.isEmail(email)) {
            return next(new HttpException(StatusCodes.BAD_REQUEST, "Invalid email"));
        }

        try {
            await this.authService.createPwdResetToken(email);
            return res.status(StatusCodes.ACCEPTED).send();
        } catch (e) {
            return next(e);
        }
    }

    private validatePwdResetToken = async (req: Request, res: Response, next: NextFunction) => {
        const token = req.query['token']?.toString();
        if (!token) {
            return next(new HttpException(StatusCodes.BAD_REQUEST, "Missing token"));
        }
        try {
            await this.authService.validatePwdResetToken(token);
            return res.status(StatusCodes.ACCEPTED).send();
        } catch (e) {
            return next(e);
        }
    }

    private resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        const {token, password, matchedPassword} = req.body;
        if (!token || password != matchedPassword) {
            return next(new HttpException(StatusCodes.BAD_REQUEST, "Password doesn't matched or missing token"));
        }

        try {
            await this.authService.resetPassword(token, password);
            return res.status(StatusCodes.ACCEPTED).send();
        } catch (e) {
            return next(e);
        }
    }
}
