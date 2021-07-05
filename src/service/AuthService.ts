import 'reflect-metadata';
import {Container, Service} from "typedi";
import AccountRepository from "../repository/AccountRepository";
import InvalidUsernameOrPassword from "../exception/InvalidUsernameOrPassword";
import JwtService from "./JwtService";
import {OAuth2Client} from "google-auth-library";
import HttpException from "../exception/HttpException";
import {StatusCodes} from "http-status-codes";
import Account from "../models/Account";
import MailSender from "../utils/MailSender";
import StringUtils from "../utils/StringUtils";
import RegisterDto from "../dto/RegisterDto";
import {randomUUID} from "crypto";
import bcrypt from "bcrypt";
import PasswordResetToken from "../models/PasswordResetToken";

@Service()
export default class AuthService {

    private accountRepository: AccountRepository;
    private jwtService: JwtService;
    private mailSender: MailSender;

    constructor() {
        this.accountRepository = Container.get(AccountRepository);
        this.jwtService = Container.get(JwtService);
        this.mailSender = Container.get(MailSender);
    }

    public login = async (email: string, password: string) => {
        const acc = await this.accountRepository.findByEmail(email);
        if (!acc) {
            throw new InvalidUsernameOrPassword();
        }

        const isPasswordCorrect = await this.checkPassword(password, acc.password);
        if (!isPasswordCorrect) {
            throw new InvalidUsernameOrPassword();
        }

        const {accessToken, refreshToken} = await this.jwtService.createToken(acc);
        return {accessToken, refreshToken};
    }

    public loginWithGoogle = async (googleToken: string) => {
        const googleClientId = process.env.GOOGLE_CLIENT_ID;
        if (!googleClientId) {
            throw new Error("Google client id not config");
        }

        const client = new OAuth2Client(googleClientId);
        try {
            const ticket = await client.verifyIdToken({
                idToken: googleToken,
                audience: googleClientId
            });

            const payload = ticket.getPayload();
            if (payload) {
                const {email, name, picture} = payload;

                let existingAcc = await this.accountRepository.findByEmail(email as string);
                if (existingAcc) {

                    // account is already existed
                    if (!existingAcc.enabled) {

                        // but not activated yet
                        existingAcc.enabled = true;

                        // then activated first
                        await existingAcc.save();
                    }

                } else {
                    //create and save new account
                    const rawPassword = StringUtils.randomString(10);
                    const encryptedPassword = await this.encryptPassword(rawPassword);
                    existingAcc = await Account.create({
                        email: email,
                        name: name,
                        avatarLink: picture,
                        enabled: true,
                        password: encryptedPassword,
                        role: "ROLE_USER"
                    });

                    this.mailSender.sendCreatedAccountEmail(existingAcc.email, rawPassword);
                }

                const {accessToken, refreshToken} = await this.jwtService.createToken(existingAcc);
                return {accessToken, refreshToken};
            }
        } catch (e) {
            console.log(e);
            throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid Google token");
        }

    }

    public reCreateToken = async (accessToken: string, refreshToken: string) => {
        let isValid = await this.jwtService.isValidToRefreshToken(accessToken, refreshToken);
        if (!isValid) {
            throw new HttpException(StatusCodes.UNAUTHORIZED, "Not eligible to refresh token");
        }

        const {email} = this.jwtService.getPayLoad(accessToken);
        const acc = await this.accountRepository.findByEmail(email);
        if (!acc) {
            throw new HttpException(StatusCodes.UNAUTHORIZED, "Account not found");
        }

        return await this.jwtService.createToken(acc);
    }

    public register = async (userData: RegisterDto) => {
        const {email, name, password} = userData;

        const acc = await this.accountRepository.findByEmail(email);
        if (!acc) {
            // email not existing

            // create a random register token
            const registerToken = randomUUID({disableEntropyCache: true});

            // encrypt password
            const encryptedPassword = await this.encryptPassword(password);

            // create and save to db
            await Account.create({
                email: email,
                name: name,
                password: encryptedPassword,
                role: "ROLE_USER",
                enabled: false,
                registerToken: registerToken
            });

            // send activation link
            const activationLink = `${process.env.DOMAIN}/auth/active/${registerToken}`;
            this.mailSender.sendActivationLink(email, activationLink);
        } else {
            if (acc.enabled) {
                // email is already in-use
                throw new HttpException(StatusCodes.CONFLICT, "Email is already existed");
            } else {
                // re-send activation link
                const registerToken = acc.registerToken;
                const activationLink = `${process.env.DOMAIN}/auth/active/${registerToken}`;
                this.mailSender.sendActivationLink(email, activationLink);

                // send back an error as warning
                throw new HttpException(StatusCodes.LOCKED, "Please check your email to verify your account!")
            }
        }
    };

    public encryptPassword = async (password: string) => {
        return await bcrypt.hash(password, 10);
    }

    public checkPassword = async (rawPassword: string, encryptedPassword: string) => {
        return await bcrypt.compare(rawPassword, encryptedPassword);
    }

    public activateAccount = async (registerToken: string) => {
        const account = await this.accountRepository.findByRegisterToken(registerToken);
        if (!account) {
            throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid register token");
        }
        console.log(account.toJSON());
        account.enabled = true;
        account.registerToken = null;
        await account.save();
    };

    public createPwdResetToken = async (email: string) => {
        const acc = await this.accountRepository.findByEmail(email);
        if (!acc) {
            throw new HttpException(StatusCodes.NOT_FOUND, "Email not found");
        }
        if (!acc.enabled) {
            throw new HttpException(StatusCodes.LOCKED, "Email is not verified");
        }

        let pwdResetToken = await PasswordResetToken.findOne({
            where: {
                accountId: acc.id
            }
        });
        //
        const token = StringUtils.randomUUID();
        const expiredDate = new Date(Date.now() + 60000 * 30);

        //
        if (!pwdResetToken) {
            //
            pwdResetToken = PasswordResetToken.build({
                token: token,
                expireDate: expiredDate,
                accountId: acc.id
            });
        } else {
            //
            pwdResetToken.expireDate = expiredDate;
        }
        pwdResetToken = await pwdResetToken.save();

        //
        let restPwdLink = `http://localhost:8080/auth/resetPassword/${pwdResetToken.token}`;
        this.mailSender.sendResetPwdLink(acc.email, restPwdLink);
    };
}

