import 'reflect-metadata';
import {Container, Service} from "typedi";
import AccountRepository from "../repository/AccountRepository";
import InvalidUsernameOrPassword from "../exception/InvalidUsernameOrPassword";
import SecurityService from "./SecurityService";

@Service()
export default class AuthService {

    private accountRepository: AccountRepository;
    private securityService: SecurityService;

    constructor() {
        this.accountRepository = Container.get(AccountRepository);
        this.securityService = Container.get(SecurityService);
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

}

