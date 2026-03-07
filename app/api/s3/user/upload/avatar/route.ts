import { s3 } from "@/app/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { prisma } from "@/app/lib/prisma";
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const authToken = request.cookies.get('complete-token');

        if (!authToken || !authToken.value)
            return NextResponse.json({ message: 'Erro! token não enviado' }, { status: 400 })

        const secret = new TextEncoder().encode(process.env.COMPLETE_PROFILE_SECRET!);
        const { payload } = await jose.jwtVerify(authToken.value, secret);

        if (!payload?.id)
            return NextResponse.json({ message: 'Token não foi valido' }, { status: 400 })

        const user = await prisma.user.findUnique({
            where: {
                id: payload.id as string
            },
            include: {
                avatar: true
            }
        });

        if (!user)
            return NextResponse.json({ message: 'Usuário nao encontrado' }, { status: 400 })

        if (!file)
            return NextResponse.json({ message: 'Erro! Nenhum arquivo enviado' }, { status: 400 });

        const path = 'avatar/' + randomUUID();

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

        const updatedUser = await prisma.user.update({
            data: {
                avatarId: createdFile.id
            },
            where: {
                id: user.id
            }
        })

        const { password, ...userResponse } = updatedUser;

        return NextResponse.json(userResponse);
    } catch(e) {
        return NextResponse.json({ message: 'Erro ao fazer upload no avatar' }, { status: 500 })
    }
}