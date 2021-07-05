import {randomUUID} from "crypto";

export default class StringUtils {

    public static randomString(length: number) {
        const charSet = [...'abcdefghijklmnopqrstuvwxyz'];
        let arr = Array.from({length: length}, () => charSet[StringUtils.randomInt(0, charSet.length - 1)]);
        return arr.join('');
    }

    public static isEmail(str: string): boolean {
        let pattern = /^[_A-Za-z0-9-+]+(.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(.[A-Za-z0-9]+)*(.[A-Za-z]{2,})$/;
        return pattern.test(str);
    }

    public static randomUUID(): string {
        return randomUUID({disableEntropyCache: true});
    }

    private static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}
