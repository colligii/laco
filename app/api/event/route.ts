import { cloudfrontGetSignedUrl } from "@/app/lib/cloudFrontgetSignedUrl";
import { prisma } from "@/app/lib/prisma";
import { validateRequest } from "@/app/lib/validateRequest";
import { EventModel, FileModel } from "@/prisma/app/generated/prisma/models";
import { NextResponse } from "next/server";

export const GET = validateRequest(async () => {

    const events: EventResponse[] = await prisma.event.findMany({
        include: {
            horizontal_file: true,
            vertical_file: true
        }
    })

    for(const event of events) {
        event.vertical_url = await cloudfrontGetSignedUrl(event.vertical_file.path, 60);
        event.horizontal_url = await cloudfrontGetSignedUrl(event.horizontal_file.path, 60);

    }

    return NextResponse.json({events})
}, undefined, undefined, 
{
    type: 'session',
    secret: process.env.AUTH_SECRET!,
    completeTokenVar: 'token'
}
)

export type EventResponse = 
    EventModel &
    { vertical_file: FileModel, vertical_url?: string } &
    { horizontal_file: FileModel, horizontal_url?: string }; 