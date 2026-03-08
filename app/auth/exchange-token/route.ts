import { NextRequest, NextResponse } from "next/server";
import * as jose from 'jose';
import { prisma } from "@/app/lib/prisma";


export async function GET(request: NextRequest) {
    try {
        const authToken = request.cookies.get('complete-token');

        if (!authToken || !authToken.value)
            return NextResponse.json({ message: 'O token para essa rota não foi definido' }, { status: 400 });

        const secret = new TextEncoder().encode(process.env.COMPLETE_PROFILE_SECRET!);

        const { payload } = await jose.jwtVerify(authToken.value, secret);

        if (!payload || typeof payload === 'string' || !payload.id)
            return NextResponse.json({ message: 'O payload não é valido' }, { status: 400 });

        const user = await prisma.user.findFirst({
            where: {
                id: payload.id
            }
        })

        if (!user)
            return NextResponse.json({ message: 'Erro no request do usuário' }, { status: 400 });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const session = await prisma.session.create({
            data: {
                userId: user.id,
                expires_at: expiresAt
            }
        })

        const newPayload = {
            id: session.id
        };

        const newSecret = new TextEncoder().encode(process.env.AUTH_SECRET!)

        const token = await new jose.SignJWT(newPayload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(newSecret);

        const response = NextResponse.redirect(new URL(`/main`, request.url));
        
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60
        })

        response.cookies.delete('complete-token');

        return response;

    } catch (e) {
        console.log(e);
        return NextResponse.redirect(new URL('/auth/error', request.url));
    }
}