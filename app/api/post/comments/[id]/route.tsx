import { cloudfrontGetSignedUrl } from "@/app/lib/cloudFrontgetSignedUrl";
import { createComment } from "@/app/lib/create-comment";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/redis";
import { validateRequest } from "@/app/lib/validateRequest";
import { getStoryByUserId } from "@/app/schemas/getStoryByUserId";
import { idIsUUID } from "@/app/schemas/idIsUUID";
import { NextRequest, NextResponse } from "next/server";
import { URL } from "url";

export const GET = validateRequest(async ({
    request,
    payloadSession,
    params
}) => {
    try {

        let comments: SqlResponse[] = await prisma.$queryRaw`
                select
                    pc.id,
                    pc.created_at,
                    pc.comment,
                    json_agg(
                        json_build_object(
                            'firstName', u."firstName",
                            'lastName', u."lastName",
                            'avatar_path', f.path
                        )
                    ) as "user"
                from
                    post_comment pc
                    inner join public."user" u on u.id = pc.user_id
                    inner join public.file f on u."avatarId" = f.id
                where pc.post_id = ${params.id}
                group by pc.id, pc.created_at, pc.comment
                order by pc.created_at
                ;
            `;

        const comment: CommentByIdResponse[] = await Promise.all(
            comments.map(async (item) => ({
                ...item,
                user: {
                    ...item.user[0],
                    avatar_path: await cloudfrontGetSignedUrl(item.user[0].avatar_path, 60 * 60),
                }
            }))
        );
        

        return NextResponse.json(comment)
    } catch (e) {
        console.log(e)
        return NextResponse.json({ message: 'Error' })
    }
}, undefined, idIsUUID,
    {
        type: 'session',
        secret: process.env.AUTH_SECRET!,
        completeTokenVar: 'token'
    }
)


export const POST = validateRequest(async ({
    request,
    payloadSession,
    params,
    body
}) => {
    try {
        const url = new URL(request.url);
        const eventId = url.searchParams.get('eventId');

        if (!payloadSession?.id)
            return NextResponse.json({ message: 'O id da sessão não está definido' }, { status: 400 })

        const user = await getSession(payloadSession?.id)

        if (!user)
            return NextResponse.json({ message: 'A sessão não está definida' }, { status: 400 })

        const comment = await prisma.postComments.create({
            data: {
                comment: body.comment,
                post_id: params.id,
                user_id: user.id
            }
        })
        return NextResponse.json(comment)
    } catch (e) {
        console.log(e)
        return NextResponse.json({ message: 'Error' })
    }
}, createComment, idIsUUID,
    {
        type: 'session',
        secret: process.env.AUTH_SECRET!,
        completeTokenVar: 'token'
    }
)


export type SqlResponse = {
    id: string,
    created_at: string,
    comment: string,
    user: {
        firstName: string,
        lastName: string,
        avatar_path: string
    }[]
}


export type CommentByIdResponse = {
    id: string,
    created_at: string,
    comment: string,
    user: {
        firstName: string,
        lastName: string,
        avatar_path: string
    }
}
