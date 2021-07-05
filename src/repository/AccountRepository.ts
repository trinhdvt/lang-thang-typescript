import {Service} from "typedi";
import Account from "../models/Account";

@Service()
export default class AccountRepository {

    public async findByEmail(email: string): Promise<Account | null> {
        return await Account.findOne({
            where: {email: email}
        });
    }

    public async findByEmailAndEnable(email: string, enabled: boolean): Promise<Account | null> {
        return await Account.findOne({
            where: {
                email: email,
                enabled: enabled
            }
        });
    }

    public async findByRegisterToken(registerToken: string) {
        return await Account.findOne({
            where: {
                registerToken: registerToken,
                enabled: false
            }
        });
    }
}