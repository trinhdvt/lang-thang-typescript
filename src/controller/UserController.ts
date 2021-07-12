import {Service} from "typedi";
import {CurrentUser, Get, HttpCode, JsonController, Param} from "routing-controllers";
import UserService from "../service/UserService";
import IUserCredential from "../interfaces/IUserCredential";
import {StatusCodes} from "http-status-codes";

@Service()
@JsonController()
export default class UserController {


    constructor(private userService: UserService) {
    }

    @Get("/users/:userId")
    @HttpCode(StatusCodes.OK)
    async getUserInfoById(@Param("userId") userId: number,
                          @CurrentUser({required: false}) currentUser: IUserCredential) {

        return await this.userService.getUserInfoById(userId, currentUser?.id);
    }
}