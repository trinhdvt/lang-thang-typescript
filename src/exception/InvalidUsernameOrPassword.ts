import HttpException from "./HttpException";
import {StatusCodes} from "http-status-codes";

export default class InvalidUsernameOrPassword extends HttpException {

    constructor() {
        super(StatusCodes.UNAUTHORIZED, 'Invalid username or password');
    }
}