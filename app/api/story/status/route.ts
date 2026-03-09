import { cloudfrontGetSignedUrl } from "@/app/lib/cloudFrontgetSignedUrl";
import { prisma } from "@/app/lib/prisma";
import { validateRequest } from "@/app/lib/validateRequest";
import { idIsUUID } from "@/app/schemas/idIsUUID";
import { NextRequest, NextResponse } from "next/server";
import { URL } from "url";

export const GET = validateRequest(async ({
    request,
    payloadSession
}) => {
    try {

    const url = new URL(request.url);
    const eventId = url.searchParams.get('eventId');
    
    if(!payloadSession?.id)
        return NextResponse.json({ message: 'O id da sessão não está definido' }, { status: 400 })

    const session = await prisma.session.findUnique({
        where: {
            id: payloadSession?.id
        },
        include: {
            user: true
        }
    })

    if(!session || !session.user)
        return NextResponse.json({ message: 'A sessão não está definida' }, { status: 400 })

    if(!idIsUUID.safeParse({ id: eventId }).success)
        return NextResponse.json({ message: 'Id do evento não está definido' }, { status: 400 })

    const stories: StoryResponse[] = await prisma.$queryRaw`
        select
            u."id" as "user_id",
            u."firstName",
            u."lastName",
            f."path" as "avatar_path",
            bool_or(sv.user_id is null) as "not_viewed",
            array_agg(s.id order by s.created_at) as "story_ids"
        from public.story s
        inner join public."user" u on u.id = s.user_id
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

    for(const story of stories) {
        story.avatar_path = await cloudfrontGetSignedUrl(story.avatar_path, 60 * 60)
    }

    return NextResponse.json(stories)
    } catch(e) {
        console.log(e)
        return NextResponse.json({ message: 'Error' })
    }
}, undefined, undefined, 
{
    type: 'session',
    secret: process.env.AUTH_SECRET!,
    completeTokenVar: 'token'
}
)

export type StoryResponse = {
    user_id: string,
    not_viewed: boolean,
    avatar_path: string,
    firstName: string,
    lastName: string,
    story_ids: string[]
}