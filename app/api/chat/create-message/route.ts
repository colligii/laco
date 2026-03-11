import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/redis";
import { validateRequest } from "@/app/lib/validateRequest";
import { createMessage } from "@/app/schemas/create-message";
import { createStoryAndPost } from "@/app/schemas/create-story-and-post";
import { NextResponse } from "next/server";
import { ChatResponse, ChatResponseUnique, SqlResponse } from "../previous/route";
import { cloudfrontGetSignedUrl } from "@/app/lib/cloudFrontgetSignedUrl";

export const getChatResponse = async (chatId: string): Promise<ChatResponseUnique | null> => {

    const chat = await prisma.$queryRaw<ChatResponseUnique[]>`
        select
            c.id,
            c.user_id,
            u."firstName",
            u."lastName",
            c.message,
            fa.path as "avatar_path",
            c.created_at
        from chat c
        inner join public."user" u on u.id = c.user_id
        inner join public.file fa on u."avatarId" = fa.id
        where c.id = ${chatId}
        order by c.created_at asc, c.id asc
        limit 20
    `;

    if (chat.length === 0) {
        return null;
    }

    const uniqueChat = chat[0];

    uniqueChat.avatar_path = await cloudfrontGetSignedUrl(uniqueChat.avatar_path, 60 * 60);

    return uniqueChat;
}

export const POST = validateRequest(async ({
    body,
    request
}) => {
    try {
        if (request.headers.get("accessToken") !== process.env.ACCESS_TOKEN) {
            return NextResponse.json(
                { message: "Access Token is not defined or invalid" },
                { status: 401 }
            );
        }


        const user = await prisma.user.findUnique({
            where: {
                id: body.user_id
            }
        });

        if (!user)
            return NextResponse.json({ message: 'A sessão não está definida' }, { status: 400 })

        const findedChat = await getChatResponse(body.id)

        if (findedChat)
            return NextResponse.json(findedChat)
        else {
            try {
                await prisma.chat.create({
                    data: {
                        id: body.id,
                        message: body.message,
                        event_id: body.event_id,
                        user_id: body.user_id
                    },
                });

                const findedChat = await getChatResponse(body.id)

                if (findedChat)
                    return NextResponse.json(findedChat)
            } catch (e: any) {
                if (e.code === 'P2002') {

                    const findedChat = await getChatResponse(body.id)

                    if (findedChat)
                        return NextResponse.json(findedChat)
                }

                throw e;
            }

            throw new Error('Idk')
        }

    } catch (e) {
        console.log(e)
        return NextResponse.json({ message: 'Error ao criar a message' }, { status: 400 })
    }

}, createMessage, undefined)