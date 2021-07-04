import IController from "../interfaces/IController";
import AuthController from "./AuthController";

export let controllers: IController[] = [
    new AuthController()
];