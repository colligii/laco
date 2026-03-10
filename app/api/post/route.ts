import { prisma } from "@/app/lib/prisma";
import { validateRequest } from "@/app/lib/validateRequest";
import { createStoryAndPost } from "@/app/schemas/create-story-and-post";
import { NextResponse } from "next/server";

export const POST = validateRequest(async ({
    payloadSession,
    body
}) => {
    try {

        if (!payloadSession?.id)
            return NextResponse.json({ message: 'A sessão não existe' }, { status: 404 });

        const session = await prisma.session.findUnique({
            where: {
                id: payloadSession.id
            },
            include: {
                user: true
            }
        })

        if (!session || !session.user)
            return NextResponse.json({ message: 'A sessão não existe' }, { status: 404 });

        const post = await prisma.post.create({
            data: {
                user_id: session.user.id,
                event_id: body.event_id,
                file_id: body.file_id
            }
        })

        return NextResponse.json(post);
    } catch (e) {
        console.log(e)
        return NextResponse.json({})
    }

}, createStoryAndPost, undefined, {
    type: 'session',
    secret: process.env.AUTH_SECRET!,
    completeTokenVar: 'token'
})