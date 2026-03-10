import { prisma } from "@/app/lib/prisma";
import { validateRequest } from "@/app/lib/validateRequest";
import { createStoryAndPost } from "@/app/schemas/create-story-and-post";
import { NextResponse } from "next/server";

export const POST = validateRequest(async ({
    payloadSession,
    body
}) => {

    if(!payloadSession?.id)
        return NextResponse.json({ message: 'A sessão não existe' }, { status: 404 });

    const session = await prisma.session.findUnique({
        where: {
            id: payloadSession.id
        },
        include: {
            user: true
        }
    })

    if(!session || !session.user)
        return NextResponse.json({ message: 'A sessão não existe' }, { status: 404 });

    const story = await prisma.story.create({
        data: {
            user_id: session.user.id,
            event_id: body.event_id,
            file_id: body.file_id
        }
    })

    return NextResponse.json(story);

}, createStoryAndPost, undefined, {
    type: 'session',
    secret: process.env.AUTH_SECRET!,
    completeTokenVar: 'token'
})