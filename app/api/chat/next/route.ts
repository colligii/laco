import { cloudfrontGetSignedUrl } from "@/app/lib/cloudFrontgetSignedUrl";
import { prisma } from "@/app/lib/prisma";
import { validateRequest } from "@/app/lib/validateRequest";
import { NextResponse } from "next/server";
import { URL } from "url";

export const GET = validateRequest(
    async ({ request }) => {
        try {

            const url = new URL(request.url);

            const payload = {
                eventId: url.searchParams.get("eventId"),
                createdAt: url.searchParams.get("createdAt") ?? null,
                chatId: url.searchParams.get("chatId") ?? null,
            };

            let chats: SqlResponse[] = await prisma.$queryRaw`
            
    select
                    c.id,
                    c.user_id,
                    u."firstName",
                    u."lastName",
                    c.message,
                    fa.path as "avatar_path",
                    c.created_at
                from
                    chat c
                    inner join public."user" u on u.id = c.user_id
                    inner join public.file fa on u."avatarId" = fa.id
                where
                    c.event_id = ${payload.eventId}
                    and (
                        ${payload.createdAt}::timestamp is null
                        or (c.created_at, c.id) > (${payload.createdAt}::timestamp, ${payload.chatId}::text)
                    )
                order by
                    c.created_at asc,
                    c.id asc
                limit 20;
        `;

            // chat precisa vir do mais velho para o mais novo
            // comments.reverse();

            chats = await Promise.all(
                chats.map(async (chat) => ({
                    ...chat,
                    avatar_path: await cloudfrontGetSignedUrl(chat.avatar_path, 60 * 60),
                }))
            );

            return NextResponse.json(chats);

        } catch (e) {
            return NextResponse.json({ message: "Error" });
        }
    },
    undefined,
    undefined,
    // {
    //     type: "session",
    //     secret: process.env.AUTH_SECRET!,
    //     completeTokenVar: "token"
    // }
);

export type ChatResponse = SqlResponse[];
export type ChatResponseUnique = SqlResponse;


export type SqlResponse = {
    id: string,
    avatar_path: string,
    user_id: string,
    message: string,
    firstName: string,
    lastName: string,
    created_at: string,
};