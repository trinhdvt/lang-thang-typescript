import 'reflect-metadata';
import {Container, Service} from "typedi";
import AccountRepository from "../repository/AccountRepository";
import InvalidUsernameOrPassword from "../exception/InvalidUsernameOrPassword";
import SecurityService from "./SecurityService";
import {OAuth2Client} from "google-auth-library";
import HttpException from "../exception/HttpException";
import {StatusCodes} from "http-status-codes";
import Account from "../models/Account";
import MailSender from "../utils/MailSender";
import StringUtils from "../utils/StringUtils";

@Service()
export default class AuthService {

    private accountRepository: AccountRepository;
    private securityService: SecurityService;
    private mailSender: MailSender;

    constructor() {
        this.accountRepository = Container.get(AccountRepository);
        this.securityService = Container.get(SecurityService);
        this.mailSender = Container.get(MailSender);
    }

    public login = async (email: string, password: string) => {
        const acc = await this.accountRepository.findByEmail(email);
        if (!acc) {
            throw new InvalidUsernameOrPassword();
        }

        const isPasswordCorrect = await this.securityService.checkPassword(password, acc.password);
        if (!isPasswordCorrect) {
            throw new InvalidUsernameOrPassword();
        }

        const {accessToken, refreshToken} = await this.securityService.createToken(acc);
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
                    const encryptedPassword = await this.securityService.encryptPassword(rawPassword);
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

                const {accessToken, refreshToken} = await this.securityService.createToken(existingAcc);
                return {accessToken, refreshToken};
            }
        } catch (e) {
            console.log(e);
            throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid Google token");
        }

    }

}

