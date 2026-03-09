import { s3 } from "@/app/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { prisma } from "@/app/lib/prisma";
import { validateRequest } from "@/app/lib/validateRequest";
import { createFile } from "@/app/schemas/createFile";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const POST = validateRequest(async ({
    body
}) => {
    try {

        const path = body.type === 'story' ? `story/${randomUUID()}` : `post/${randomUUID()}`
        const mimetype = body.fileType === 'photo' ? 'image/webp' : 'video/webm';

        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: path,
            ContentType: mimetype
        });

        const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 })

        const createdFile = await prisma.file.create({
            data: {
                path,
                type: body.fileType === 'photo' ? 'Photo' : 'Video'
            }
        });

        return NextResponse.json({ file: createdFile, url });
    } catch (e) {
        return NextResponse.json({ message: 'Erro ao fazer upload no avatar' }, { status: 500 })
    }

}, createFile, undefined,
    {
        type: 'session',
        secret: process.env.AUTH_SECRET!,
        completeTokenVar: 'token'
    }
)
