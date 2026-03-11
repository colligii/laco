import { cloudfrontGetSignedUrl } from "@/app/lib/cloudFrontgetSignedUrl";
import { prisma } from "@/app/lib/prisma";
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

        const url = new URL(request.url);
        const eventId = url.searchParams.get('eventId');

        if (!payloadSession?.id)
            return NextResponse.json({ message: 'O id da sessão não está definido' }, { status: 400 })

        const session = await prisma.session.findUnique({
            where: {
                id: payloadSession?.id
            },
            include: {
                user: true
            }
        })

        if (!session || !session.user)
            return NextResponse.json({ message: 'A sessão não está definida' }, { status: 400 })

        if (!idIsUUID.safeParse({ id: eventId }).success)
            return NextResponse.json({ message: 'Id do evento não está definido' }, { status: 400 })

        let posts: PostIdResponse[] = await prisma.$queryRaw`
            with post_reaction_count as (
                select
                    pr.post_id,
                    COUNT(*) FILTER (WHERE pr.reaction = 'Like')  as like,
                    COUNT(*) FILTER (WHERE pr.reaction = 'Smile') as smile,
                    COUNT(*) FILTER (WHERE pr.reaction = 'Clap')  as clap,
                    COUNT(*) FILTER (WHERE pr.reaction = 'Heart') as heart,

                    MAX(pr.reaction) FILTER (WHERE pr.user_id = ${session.user.id})
                        as my_reaction

                from public.post_reaction pr
                group by pr.post_id
            )

            select
                p.id,
                p.created_at,
                f.type,
                u."firstName",
                u."lastName",
                f2.path as "avatar_path",
                f.path as "post_path",
                json_agg(
                    json_build_object(
                            'like', coalesce(prc.like,0),
                            'smile', coalesce(prc.smile,0),
                            'clap', coalesce(prc.clap,0),
                            'heart', coalesce(prc.heart,0),
                            'my_reaction', prc.my_reaction
                    )
                ) as "post_reaction"
            from post p
                inner join public."user" u on p.user_id = u.id
                inner join public."file" f on p.file_id = f.id
                inner join public.file f2 on f2.id = u."avatarId"
                left join post_reaction_count prc on prc.post_id = p.id
            where p.id = ${params.id} AND p.event_id = ${eventId}

                group by
                    p.id, p.created_at, u."firstName", u."lastName", f2.path, f.path, f.type;
        `;

        const post: PostIdResponse = posts[0];
        
        post.avatar_path = await cloudfrontGetSignedUrl(post.avatar_path, 60 * 60)
        post.post_path = await cloudfrontGetSignedUrl(post.post_path, 60 * 60)

        return NextResponse.json(post)
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


export type PostIdResponse = {
    id: string,
    created_at: string,
    firstName: string,
    lastName: string,
    type: string,
    avatar_path: string,
    post_path: string,  
    post_reaction: {
        like: number,
        smile: number,
        clap: number,
        heart: number,
        my_reaction?: string,
    }[]
}