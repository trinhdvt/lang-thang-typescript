import mapper from "js-model-mapper";
import {plainToClass} from "class-transformer";
import Account from "../models/Account";
import Role from "../models/Role";

export const accountMapper = mapper([{
    name: "accountId",
    from: "id"
}, 'name', 'email', 'fbLink', 'instagramLink', 'avatarLink', 'about'])

export class AccountDto {
    // regular
    accountId: number;
    name: string;
    email: string;
    fbLink: string;
    instagramLink: string;
    avatarLink: string;
    about: string;
    role: string;

    // special mapping
    isFollowed: boolean;
    postCount: number;
    followCount: number;
    bookmarkOnOwnPostCount: number;
    commentOnOwnPostCount: number;


    public static toBasicAccount(entity: Account) {
        const json = accountMapper(entity);

        let accountDto = plainToClass(AccountDto, json);
        accountDto.role = entity.role == Role.ROLE_ADMIN ? Role.ROLE_ADMIN : undefined;

        return accountDto;
    }
}
