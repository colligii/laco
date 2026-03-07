import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "./app/lib/prisma";
import * as jose from "jose";

export async function middleware(request: NextRequest) {
    try {
        const authToken = request.cookies.get('complete-token');

        if(!authToken || !authToken.value)
            return NextResponse.json({ message: 'Auth Token is not defined' }, { status: 400 });

        const secret = new TextEncoder().encode(process.env.COMPLETE_PROFILE_SECRET!);

        const { payload } = await jose.jwtVerify(authToken.value, secret);

        if(!payload)
            return NextResponse.json({ message: 'Payload is not valid' }, { status: 400 });

        if(!payload || typeof payload === 'string' || !payload.id)
            return NextResponse.json({ message: 'Payload is not valid' }, { status: 400 });
        
        const url = new URL(request.url);

        const userRequest = await fetch(`${url.origin}/api/user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                accessToken: process.env.ACCESS_TOKEN!
            },
            body: JSON.stringify({
                id: payload.id as string
            })
        })

        if(userRequest.status !== 200)
            return NextResponse.json({ message: 'Error in request user' }, { status: 400 })
        
        const user = await userRequest.json();

        if(!user)
            return NextResponse.json({ message: 'User not founded' }, { status: 400 });

        if(user.firstName && user.lastName && user.avatarId) {
            return NextResponse.redirect(new URL('/main', request.url))
        }

        const requestHeaders = new Headers(request.headers);
        
        requestHeaders.set('x-first-name', user.firstName ?? '');
        requestHeaders.set('x-last-name', user.lastName ?? '');

        return NextResponse.next({
            request: { headers: requestHeaders }
        });
    
    } catch(e) {
        return NextResponse.redirect(new URL('/auth/error', request.url));
    }
}

export const config = {
    matcher: '/complete-profile'
}