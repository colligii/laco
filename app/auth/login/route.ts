import { prisma } from "@/app/lib/prisma";
import { validateRequest } from "@/app/lib/validateRequest";
import { loginUser } from "@/app/schemas/login-user";
import { NextResponse } from "next/server";
import * as bcrypt from 'bcrypt';
import * as jose from 'jose';
import { createSession } from "@/app/lib/redis";

export const POST = validateRequest(async ({ body }) => {
    try {
        const findedUser = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        })
    
        if(!findedUser || !findedUser.password)
            return NextResponse.json({ message: 'Usuário ou senha incorretos' }, { status: 401 });
        
        const isPasswordValid = await bcrypt.compare(body.password, findedUser.password);
        
        if(!isPasswordValid)
            return NextResponse.json({ message: 'Usuário ou senha incorretos' }, { status: 401 });
    
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const newPayload = {
            id: await createSession(findedUser)
        };

        const newSecret = new TextEncoder().encode(process.env.AUTH_SECRET!)

        const token = await new jose.SignJWT(newPayload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(newSecret);

        const response = NextResponse.json({ message: 'Login com sucesso' });
        
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60
        })

        response.cookies.delete('complete-token');

        return response;
    } catch(e) {
        console.log(e)
        return NextResponse.json({ message: 'Erro ao tentar fazer login' })
    }
}, loginUser)