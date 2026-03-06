import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/prisma/app/generated/prisma/client';
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
    try {
        const prismaClient = new PrismaClient({
            adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
        });

        const authToken = request.headers.get('authToken');

        if(!authToken)
            return NextResponse.json({ message: 'Auth Token is not defined' }, { status: 400 });

        const isPayloadValid = jwt.verify(authToken, process.env.COMPLETE_PROFILE_SECRET!);

        if(!isPayloadValid)
            return NextResponse.json({ message: 'Payload is not valid' }, { status: 400 });

        const payload = jwt.decode(authToken);

        if(!payload || typeof payload === 'string' || !payload.id)
            return NextResponse.json({ message: 'Payload is not valid' }, { status: 400 });
        
        const user = await prismaClient.user.findFirst({
            where: {
                id: payload.id
            }
        })
        
        if(!user)
            return NextResponse.json({ message: 'User not founded' }, { status: 400 });

        return NextResponse.json(user);
    } catch(e) {
        return NextResponse.redirect(new URL('/auth/error', request.url));
    }
}