import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_ACCESS_KEY_SECRET!
    },
    region: process.env.S3_BUCKET_REGION!
})
