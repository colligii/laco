import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from "next/server";


export async function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const requestUrl = new URL(request.url);
    const accessToken = requestUrl.searchParams.get('access_token');
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!, 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: request.cookies
        }
    );

    if(!accessToken)
        return NextResponse.redirect(new URL('/auth/error', request.url));

    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if(!user)
        return NextResponse.redirect(new URL('/auth/error', request.url));

    const requestHeaders = new Headers(request.headers);

    if(user.app_metadata.provider === 'google') {
        const [firstName, lastName] = (user.user_metadata.full_name ?? '').split(' ');
        requestHeaders.set('x-first-name', firstName);
        requestHeaders.set('x-last-name', lastName);
    }

    return NextResponse.next({
        request: {
            headers: requestHeaders
        }
    });
}

export const config = {
    matcher: '/complete-profile'
}