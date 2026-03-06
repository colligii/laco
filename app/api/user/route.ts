import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST({ headers, json }: NextRequest) {
    try {
        const body = await json();

        if (headers.get('accessToken') !== process.env.ACCESS_TOKEN)
            return NextResponse.json({ message: 'Access Token is not defined' }, { status: 200 })

        if (!body?.id)
            return NextResponse.json({ message: 'Id is invalid' }, { status: 400 })

        const user = await prisma.user.findFirst({
            where: {
                id: body.id
            }
        })

        return NextResponse.json(user);
    } catch (e) {
        return NextResponse.json({ message: 'Some error ocurred' }, { status: 500 })
    }
}