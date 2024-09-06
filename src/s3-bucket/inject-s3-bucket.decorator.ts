import { Inject } from "@nestjs/common";
import { getBucketToken } from "./get-bucket-token.helper";

export const InjectS3Bucket = (bucketName: string) => {
    return Inject(getBucketToken(bucketName));
};