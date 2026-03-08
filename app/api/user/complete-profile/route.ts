import { prisma } from "@/app/lib/prisma";
import { validateRequest } from "@/app/lib/validateRequest";
import { idIsUUID } from "@/app/schemas/idIsUUID";
import { patchUser } from "@/app/schemas/patch-user";
import { NextResponse } from "next/server";
import { User } from "@/prisma/app/generated/prisma/client";


export const PATCH = validateRequest(async ({
    body,
    payloadUser
}) => {

    if(!payloadUser)
        return NextResponse.json({ message: 'Token inválido' }, { status: 401 })
        
    const user = await prisma.user.findUnique({
        where: {
            id: payloadUser?.id
        }
    })

    if(!user)
        return NextResponse.json({ message: 'Ususário não foi encontrado' });

    const updatedUser = await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            firstName: body.firstName,
            lastName: body.lastName
        }
    })

    const { password, ...responseUser } = updatedUser; 

    return NextResponse.json(responseUser)
}, patchUser, undefined, {
    type: 'user',
    secret: process.env.COMPLETE_PROFILE_SECRET!,
    completeTokenVar: 'complete-token'
})