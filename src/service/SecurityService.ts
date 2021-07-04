import {Service} from "typedi";
import jwt from "jsonwebtoken";
import RefreshToken from "../models/RefreshToken";
import Account from "../models/Account";

require('dotenv').config();

@Service()
export default class SecurityService {
    private readonly SECRET_KEY: string;
    private readonly EXPIRE_TIME: string;
    private bcrypt = require('bcrypt');

    constructor() {
        this.SECRET_KEY = process.env.TOKEN_SECRET as string;
        this.EXPIRE_TIME = process.env.TOKEN_TIME as string;
    }

    public createToken = async (account: Account) => {
        const payload = {
            id: account.id,
            email: account.email,
            role: account.role
        }
        const accessToken = jwt.sign(payload,
            this.SECRET_KEY,
            {
                expiresIn: this.EXPIRE_TIME
            });

        // const duration = ms(this.EXPIRE_TIME);

        const refreshToken = await this.createRefreshToken(accessToken, account.email);

        return {accessToken, refreshToken};
    }

    private createRefreshToken = async (accessToken: string, email: string) => {
        const randomString = Math.random().toString(36).substring(2);

        const rfToken = Buffer.from(randomString).toString("base64");

        // save token to db
        const rs = await RefreshToken.findByPk(email);
        if (rs) {
            // update if already exist
            rs.accessToken = accessToken;
            rs.refreshToken = rfToken;
            await rs.save();
        } else {
            // create a new one
            await RefreshToken.create({
                email: email,
                accessToken: accessToken,
                refreshToken: rfToken
            });
        }
        //

        return rfToken;
    }

    public encryptPassword = async (password: string) => {
        return await this.bcrypt.hash(password, 10);
    }

    public checkPassword = async (rawPassword: string, encryptedPassword: string) => {
        return await this.bcrypt.compare(rawPassword, encryptedPassword);
    }
}