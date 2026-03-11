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
    payloadSession,
}) => {
    try {
        if (!payloadSession?.id)
            return NextResponse.json({ message: 'O id da sessão não está definido' }, { status: 400 })

        const user = await getSession(payloadSession?.id)

        if (!user)
            return NextResponse.json({ message: 'A sessão não está definida' }, { status: 400 })

        return NextResponse.json(payloadSession);
    } catch (e) {
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
