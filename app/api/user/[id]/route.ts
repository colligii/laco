import { prisma } from "@/app/lib/prisma";
import { validateRequest } from "@/app/lib/validateRequest";
import { idIsUUID } from "@/app/schemas/idIsUUID";
import { patchUser } from "@/app/schemas/patch-user";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = validateRequest(({}) => {
    return NextResponse.json({})
}, patchUser, idIsUUID)

export const GET = validateRequest(async ({
    params,
    request: { headers }
}) => {
    try {
        if (headers.get('accessToken') !== process.env.ACCESS_TOKEN)
            return NextResponse.json({ message: 'Access Token is not defined' }, { status: 200 })

        if (!params?.id)
            return NextResponse.json({ message: 'Id is invalid' }, { status: 400 })

        const user = await prisma.user.findFirst({
            where: {
                id: params.id
            }
        })

        return NextResponse.json(user);
    } catch (e) {
        return NextResponse.json({ message: 'Some error ocurred' }, { status: 500 })
    }
}, undefined, idIsUUID)