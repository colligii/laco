import { cloudfrontGetSignedUrl } from "@/app/lib/cloudFrontgetSignedUrl";
import { prisma } from "@/app/lib/prisma";
import { validateRequest } from "@/app/lib/validateRequest";
import { NextResponse } from "next/server";
import { URL } from "url";

export const GET = validateRequest(async ({ request }) => {
    try {

        const url = new URL(request.url);

        const payload = {
            eventId: url.searchParams.get('eventId'),
            createdAt: url.searchParams.get('createdAt') ?? null,
            postId: url.searchParams.get('postId') ?? null
        }

        let posts: SqlResponse[] = await prisma.$queryRaw`
            select
                p.id,
                u."firstName",
                u."lastName",
                fa.path as "avatar_path",
                f.path,
                f.type,
                p.created_at
            from
                post p
                inner join public."user" u on u.id = p.user_id
                inner join public.file f on f.id = p.file_id
                inner join public.file fa on u."avatarId" = fa.id
            where
                (
                    ${payload.createdAt}::timestamp is null
                    or (p.created_at, p.id) > (${payload.createdAt}::timestamp, ${payload.postId}::text)
                )
            order by
                p.created_at,
                p.id
            limit 20;
        `;

        posts = posts.reverse();
        
        posts = await Promise.all(
            posts.map(async (post) => ({
                ...post,
                avatar_path: await cloudfrontGetSignedUrl(post.avatar_path, 60 * 60),
                path: await cloudfrontGetSignedUrl(post.path, 60 * 60)
            }))
        )


        return NextResponse.json(posts)


    } catch (e) {
        return NextResponse.json({ message: 'Error' })
    }
},
    undefined,
    undefined,
    {
        type: 'session',
        secret: process.env.AUTH_SECRET!,
        completeTokenVar: 'token'
    }
)

export type PostResponse = SqlResponse[];

export type SqlResponse = {
    id: string,
    avatar_path: string,
    firstName: string,
    lastName: string,
    path: string,
    created_at: string,
    type: string
}