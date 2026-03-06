import { PrismaClient } from "@/prisma/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';


export async function GET(request: NextRequest) {
    try {
        const requestUrl = new URL(request.url);
        const searchParams = requestUrl.searchParams;
        const requestHeaders = new Headers(request.headers);
        const prismaClient = new PrismaClient({
            adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
        });

        let email;
        let firstName;
        let lastName;

        if (searchParams.get('type') === 'external') {
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: request.cookies
                }
            );

            const accessToken = requestUrl.searchParams.get('access_token');

            if (!accessToken)
                throw new Error('Access Token must be defined');

            const { data: { user } } = await supabase.auth.getUser(accessToken);

            if (!user)
                throw new Error('User is not defined')

            if (user.app_metadata.provider === 'google') {
                const nameSplited = (user.user_metadata.full_name ?? '').split(' ');

                firstName = nameSplited[0];
                lastName = nameSplited[1];
                email = user.user_metadata.email!;

                requestHeaders.set('x-first-name', firstName);
                requestHeaders.set('x-last-name', lastName);
            }


        }

        if (!email)
            throw new Error('E-mail is not defined');

        let user = await prismaClient.user.findFirst({
            where: {
                email: email!
            }
        });

        if (!user) {
            user = await prismaClient.user.create({
                data: {
                    email: email!,
                    firstName,
                    lastName,
                    provider: 'Google'
                }
            });
        }

        if (!user.firstName || !user.lastName || !false) {
            const payload = {
                id: user.id
            }

            const token = jwt.sign(payload, process.env.COMPLETE_PROFILE_SECRET!, {
                expiresIn: "1h"
            })

            requestHeaders.set('complete-token', token);

            return NextResponse.redirect(new URL(`/complete-profile?authToken=${token}`, request.url));
        }




        return new NextResponse('<h1></h1>', {
            status: 200, headers: {
                'Content-Type': 'text/html'
            }
        });
    } catch (e) {
        return NextResponse.redirect(new URL('/auth/error', request.url));
    }
}