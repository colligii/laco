import { cloudfrontGetSignedUrl } from "@/app/lib/cloudFrontgetSignedUrl";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/redis";
import { validateRequest } from "@/app/lib/validateRequest";
import { idIsUUID } from "@/app/schemas/idIsUUID";
import { FileModel, UserModel } from "@/prisma/app/generated/prisma/models";
import { NextResponse } from "next/server";

export const GET = validateRequest(async ({
    payloadSession
}) => {
    try {
        if(!payloadSession || !payloadSession.id)
            return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    
        const user = await getSession(payloadSession.id, {
            avatar: true
        });
    
        if(!user)
            return NextResponse.json({ message: 'Sessão não encontrada' }, { status: 404 });
    
        const { password, ...userResponse } = user as unknown as UserResponse;
    
        userResponse.avatar_url = await cloudfrontGetSignedUrl(userResponse.avatar.path, 60);
    
        return NextResponse.json(userResponse);
    } catch(e) {
        console.log(e)
        return NextResponse.json({ message: 'Erro ao tentar pegar usuário' }, { status: 500 })
    }
}, 
undefined, undefined, 
{
    type: 'session',
    secret: process.env.AUTH_SECRET!,
    completeTokenVar: 'token'
}
)

export type UserResponse = UserModel & { avatar: FileModel, avatar_url: string };