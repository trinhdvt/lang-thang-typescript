import aws from "aws-sdk";
import {Service} from "typedi";
import path from "path";
import {readFileSync} from "fs";
import fileType from "file-type";

const BUCKET = process.env.BUCKET;
const REGION = process.env.REGION;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

@Service()
export default class StorageServices {
    readonly s3 = new aws.S3({
        region: REGION,
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY
    });

    constructor() {
    }

    public async uploadFile(filePath: string) {
        const key = path.basename(filePath);

        const buffer = readFileSync(filePath);
        await this.s3.putObject({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ACL: 'public-read',
            ContentType: (await fileType.fromBuffer(buffer)).mime
        }).promise();

        return `https://${BUCKET}.s3-${REGION}.amazonaws.com/${key}`;
    }
}