import { s3 } from "@/app/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { prisma } from "@/app/lib/prisma";
import { validateRequest } from "@/app/lib/validateRequest";

export const POST = validateRequest(async ({
    request
}) => {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file)
            return NextResponse.json({ message: 'Erro! Nenhum arquivo enviado' }, { status: 400 });

        const path = 'story/' + randomUUID();

        const buffer = Buffer.from(await file.arrayBuffer());

        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: path,
            Body: buffer,
            ContentType: file.type
        });

        await s3.send(command);

        const createdFile = await prisma.file.create({
            data: {
                path
            }
        });

        return NextResponse.json(createdFile);
    } catch (e) {
        return NextResponse.json({ message: 'Erro ao fazer upload no avatar' }, { status: 500 })
    }

}, undefined, undefined,
    {
        type: 'session',
        secret: process.env.AUTH_SECRET!,
        completeTokenVar: 'token'
    }
)
