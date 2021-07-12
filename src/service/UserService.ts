import {Service} from "typedi";
import AccountRepository from "../repository/AccountRepository";
import {NotFoundError} from "routing-controllers";
import {AccountDto} from "../dto/AccountDto";

@Service()
export default class UserService {

    constructor(private accRepo: AccountRepository) {
    }


    public async getUserInfoById(userId: number, curUserId: number | undefined) {
        const acc = await this.accRepo.findById(userId);
        if (!acc) {
            throw new NotFoundError("Account not found");
        }

        const accountDto = AccountDto.toBasicAccount(acc);
        accountDto.postCount = acc.posts.length;
        accountDto.followCount = acc.followingMe.length;
        accountDto.bookmarkOnOwnPostCount = await this.accRepo.countTotalBookmark(userId);
        accountDto.commentOnOwnPostCount = await this.accRepo.countTotalComment(userId);

        for (const f of acc.followingMe) {
            if (f.id == curUserId) {
                accountDto.isFollowed = true;
                break;
            }
        }

        return accountDto;
    }
}