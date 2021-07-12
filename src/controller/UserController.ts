import {Service} from "typedi";
import {BadRequestError, CurrentUser, Get, HttpCode, JsonController, Param, QueryParam} from "routing-controllers";
import UserService from "../service/UserService";
import IUserCredential from "../interfaces/IUserCredential";
import {StatusCodes} from "http-status-codes";
import {isEmail} from "class-validator";

@Service()
@JsonController()
export default class UserController {


    constructor(private userService: UserService) {
    }

    @Get("/user/:userId")
    @HttpCode(StatusCodes.OK)
    async getUserInfoById(@Param("userId") userId: number,
                          @CurrentUser({required: false}) currentUser: IUserCredential) {

        return await this.userService.getUserInfoById(userId, currentUser?.id);
    }

    @Get("/user")
    @HttpCode(StatusCodes.OK)
    async getUserInfoByEmail(@QueryParam("email") email: string,
                             @CurrentUser({required: false}) currentUser: IUserCredential) {
        if (!isEmail(email)) {
            throw new BadRequestError("Invalid email address");
        }

        return await this.userService.getUserInfoByEmail(email, currentUser?.id);
    }
}