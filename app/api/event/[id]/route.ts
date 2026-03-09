import { prisma } from "@/app/lib/prisma";
import { validateRequest } from "@/app/lib/validateRequest";
import { idIsUUID } from "@/app/schemas/idIsUUID";
import { NextResponse } from "next/server";

export const GET = validateRequest(async ({
    params
}) => {
    const event = await prisma.event.findUnique({
        where: {
            id: params.id
        }
    })

    if(!event)
        return NextResponse.json({ message: 'O evento não existe' }, { status: 400 })

    return NextResponse.json(event);
}, 
undefined, idIsUUID, 
{
    type: 'session',
    secret: process.env.AUTH_SECRET!,
    completeTokenVar: 'token'
}
)