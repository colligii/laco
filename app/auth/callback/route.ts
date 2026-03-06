import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);

    const searchParams = requestUrl.searchParams;

    searchParams.append('type', 'external')

    const searchParamsAsString = searchParams.toString();
    const accessToken = searchParams.get('access_token');
    const url = `/auth/finish?${searchParamsAsString}`;

    if(accessToken) {
        return NextResponse.redirect(new URL(url, request.url));
    }

    return new NextResponse(`
        <script>            
            if(window.location.hash) {
                const params = window.location.hash.slice(1);

                const endUrl = (
                    window.location.origin +
                    window.location.pathname +
                    '?' +
                    params
                )

                window.location.href = endUrl;
            } else {
                window.location.href = '/auth/error'; 
            }
        </script>`, {
            status: 200,
            headers: {
                'Content-Type': 'text/html'
            }
    })
}