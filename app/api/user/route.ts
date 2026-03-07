import { prisma } from "@/app/lib/prisma";
import { validateRequest } from "@/app/lib/validateRequest";
import { registerUser } from "@/app/schemas/register-user";
import { Prisma } from "@/prisma/app/generated/prisma/client";
import { NextResponse } from "next/server";
import * as jose from "jose"
import * as bcrypt from 'bcrypt'

export const POST = validateRequest(async ({ body }) => {
    try {
        const findedUser = await prisma.user.findUnique({
            where: {
                id: body.email
            }
        })

        if(findedUser)
            return NextResponse.json({ message: 'Usuário já criado' }, { status: 400 });

        let createdUser;

        const encryptedPassword = await bcrypt.hash(body.password, 12);

        try {
            createdUser = await prisma.user.create({
                data: {
                    email: body.email,
                    password: encryptedPassword
                }    
            });
        } catch(e) {
            if(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')
                return NextResponse.json({ message: 'Usuário já criado' }, { status: 400 });

            throw e;
        }

        const response = NextResponse.json(createdUser);

        const secret = new TextEncoder().encode(process.env.COMPLETE_PROFILE_SECRET!)

        const payload = {
            id: createdUser.id
        };

        const token = await new jose.SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('2h')
            .sign(secret);

        response.cookies.set('complete-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60
        })

        return response;

    } catch(e) {
        console.log(e)
        return NextResponse.json({ message: 'Erro ao tentar criar usuário!' }, { status: 500 })
    }
}, registerUser)