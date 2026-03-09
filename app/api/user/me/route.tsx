import { cloudfrontGetSignedUrl } from "@/app/lib/cloudFrontgetSignedUrl";
import { prisma } from "@/app/lib/prisma";
import { validateRequest } from "@/app/lib/validateRequest";
import { idIsUUID } from "@/app/schemas/idIsUUID";
import { FileModel, UserModel } from "@/prisma/app/generated/prisma/models";
import { NextResponse } from "next/server";

export const GET = validateRequest(async ({
    payloadSession
}) => {
    if(!payloadSession || !payloadSession.id)
        return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })

    const session = await prisma.session.findUnique({
        where: {
            id: payloadSession.id
        },
        include: {
            user: {
                include: {
                    avatar: true
                }
            }
        }
    });

    if(!session)
        return NextResponse.json({ message: 'Sessão não encontrada' }, { status: 404 });

    const { password, ...userResponse } = session.user as unknown as UserResponse;

    userResponse.avatar_url = await cloudfrontGetSignedUrl(userResponse.avatar.path, 60);

    return NextResponse.json(userResponse);
}, 
undefined, undefined, 
{
    type: 'session',
    secret: process.env.AUTH_SECRET!,
    completeTokenVar: 'token'
}
)

export type UserResponse = UserModel & { avatar: FileModel, avatar_url: string };