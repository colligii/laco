import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "./app/lib/prisma";
import * as jose from "jose";

export async function middleware(request: NextRequest) {
    try {
        const url = new URL(request.url);

        if(url.pathname === '/complete-profile') {

            const authToken = request.cookies.get('complete-token');
    
            if(!authToken || !authToken.value)
                throw new Error('Auth Token is not defined');
    
            const secret = new TextEncoder().encode(process.env.COMPLETE_PROFILE_SECRET!);
    
            const { payload } = await jose.jwtVerify(authToken.value, secret);
    
            if(!payload)
                throw new Error('Payload is not valid');

            if(!payload || typeof payload === 'string' || !payload.id)
                throw new Error('Payload is not valid');            
    
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
                throw new Error('Error in request user');

            const user = await userRequest.json();
    
            if(!user)
                throw new Error('User not founded');
                
            if(user.firstName && user.lastName && user.avatarId) {
                return NextResponse.redirect(new URL('/main', request.url))
            }
    
            const requestHeaders = new Headers(request.headers);
            
            requestHeaders.set('x-first-name', user.firstName ?? '');
            requestHeaders.set('x-last-name', user.lastName ?? '');
    
            return NextResponse.next({
                request: { headers: requestHeaders }
            });    
        }

        else if(url.pathname === '/main') {
            const authToken = request.cookies.get('token');
    
            if(!authToken || !authToken.value)
                throw new Error('Auth Token is not defined');
                
            const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
    
            const { payload } = await jose.jwtVerify(authToken.value, secret);
    
            if(!payload)
                throw new Error('Payload is not valid');

            if(!payload || typeof payload === 'string' || !payload.id)
                throw new Error('Payload is not valid');
                
    
            const userRequest = await fetch(`${url.origin}/api/user/by-session-id/${payload.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    accessToken: process.env.ACCESS_TOKEN!
                }
            })
    
            if(userRequest.status !== 200)
                throw new Error('Error in request user');
    
            const user = await userRequest.json();
    
            if(!user)
                throw new Error('User not founded');
        }

        return NextResponse.next();

    } catch(e) {
        const redirect = NextResponse.redirect(new URL('/auth/error', request.url));
    
        redirect.cookies.delete('complete-token');
        redirect.cookies.delete('token');

        return redirect;
    }
}