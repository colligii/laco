import { GetObjectCommand } from "@aws-sdk/client-s3"
import { s3 } from './s3';
import { getSignedUrl } from "@aws-sdk/cloudfront-signer"


export const cloudfrontGetSignedUrl = async (key: string, expiresInS: number) => {
    return await getSignedUrl({
        url: `${process.env.CLOUDFRONT_URL!}/${key}`,
        keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
        privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!,
        dateLessThan: new Date(Date.now() + expiresInS * 1000)
    });
}