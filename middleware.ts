import { NextRequest, NextResponse } from "next/server";


export async function middleware(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const searchParams = url.searchParams;


        const fetchUser = await fetch(`${url.origin}/auth/check/complete`, {
            headers: {
                authToken: searchParams.get('authToken')!
            },
            method: 'POST'
        })

        const fetchUserJson = await fetchUser.json()

        if(fetchUser.status !== 200)
            throw new Error('Error when trying to validate')

        const requestHeaders = new Headers(request.headers);
        
        requestHeaders.set('x-first-name', fetchUserJson.firstName ?? '');
        requestHeaders.set('x-last-name', fetchUserJson.lastName ?? '');

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