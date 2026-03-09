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

        let stories: UserIdStoryResponse[] = await prisma.$queryRaw`
        select
    u."id" as "user_id",
    u."firstName",
    u."lastName",
    f."path" as "avatar_path",

    json_agg(
        json_build_object(
            'id', s.id,
            'path', sf.path,
            'created_at', s.created_at,
            'type', sf.type,
            'not_viewed', (sv.user_id is null)
        )
        order by s.created_at
    ) as stories

from public.story s
inner join public."file" sf on s.file_id = sf.id
inner join public."user" u on u.id = s.user_id and u.id = ${params.userId}
inner join public."file" f on u."avatarId" = f.id

left join public.story_viewed sv 
    on s.id = sv.story_id 
    and sv.user_id = ${session.user.id}

where s.event_id = ${eventId}

group by
    u.id,
    u."firstName",
    u."lastName",
    f.path

order by
    (u.id = ${session.user.id}) desc,
    bool_or(sv.user_id is null) desc,
    max(s.created_at) desc;
        `;

        const story: UserIdStoryResponse = stories[0];
        story.avatar_path = await cloudfrontGetSignedUrl(story.avatar_path, 60 * 60)

        story.stories = await Promise.all(
            story.stories.map(async (story) => ({
                ...story,
                path: await cloudfrontGetSignedUrl(story.path, 60 * 10)
            }))
        )

        return NextResponse.json(story)
    } catch (e) {
        console.log(e)
        return NextResponse.json({ message: 'Error' })
    }
}, undefined, getStoryByUserId,
    {
        type: 'session',
        secret: process.env.AUTH_SECRET!,
        completeTokenVar: 'token'
    }
)

export type UserIdStoryResponse = {
    user_id: string,
    not_viewed: boolean,
    avatar_path: string,
    firstName: string,
    lastName: string,
    stories: {
        id: string,
        path: string,
        created_at: Date,
        not_viewed: boolean,
        type: 'Video' | 'Photo'
    }[]
}