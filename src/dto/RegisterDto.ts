import {IsEmail, IsNotEmpty, MinLength} from "class-validator";

export default class RegisterDto {

    @IsNotEmpty()
    name!: string;

    @IsEmail()
    email!: string;

    @MinLength(6)
    password!: string;

    @MinLength(6)
    matchedPassword!: string;
}