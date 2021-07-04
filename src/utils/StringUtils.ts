export default class StringUtils {

    public static randomString(length: number) {
        const charSet = [...'abcdefghijklmnopqrstuvwxyz'];
        let arr = Array.from({length: length}, () => charSet[StringUtils.randomInt(0, charSet.length - 1)]);
        return arr.join('');
    }

    private static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
