import { cloudfrontGetSignedUrl } from "@/app/lib/cloudFrontgetSignedUrl";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/redis";
import { validateRequest } from "@/app/lib/validateRequest";
import { idIsUUID } from "@/app/schemas/idIsUUID";
import { NextRequest, NextResponse } from "next/server";
import { URL } from "url";

export const PATCH = validateRequest(async ({
    params,
    payloadSession
}) => {
    try {

        if (!payloadSession?.id)
            return NextResponse.json({ message: 'O id da sessão não está definido' }, { status: 400 })

        const user = await getSession(payloadSession.id);

        if (!user)
            return NextResponse.json({ message: 'A sessão não está definida' }, { status: 400 })

        const story = await prisma.story.findUnique({
            where: {
                id: params.id
            }
        });

        if(!story)
            return NextResponse.json({ message: 'Story não existe' }, { status: 400 })

        const createdStoryViewed = await prisma.storyViewed.create({
            data: {
                story_id: params.id,
                user_id: user.id
            }
        })

        return NextResponse.json(createdStoryViewed)
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

export type StoryResponse = {
    user_id: string,
    not_viewed: boolean,
    avatar_path: string,
    firstName: string,
    lastName: string,
    story_ids: string[]
}