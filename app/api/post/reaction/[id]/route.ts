import { cloudfrontGetSignedUrl } from "@/app/lib/cloudFrontgetSignedUrl";
import { prisma } from "@/app/lib/prisma";
import { validateRequest } from "@/app/lib/validateRequest";
import { idIsUUID } from "@/app/schemas/idIsUUID";
import { reaction, reactionType } from "@/app/schemas/reaction";
import { PostReactionModel } from "@/prisma/app/generated/prisma/models";
import { NextRequest, NextResponse } from "next/server";
import { URL } from "url";
import { PostReaction } from "../../getData/[id]/route";
import { getSession } from "@/app/lib/redis";

export async function toggleReaction(postReaction: PostReactionModel, body: reactionType) {
    if(postReaction.reaction === body.reaction) {
        await prisma.postReaction.delete({
            where: {
                post_id_user_id: {
                    post_id: postReaction.post_id,
                    user_id: postReaction.user_id
                }
            }
        });

        return { deleted: true }
    }

    await prisma.postReaction.update({
        where: {
            post_id_user_id: {
                post_id: postReaction.post_id,
                user_id: postReaction.user_id
            },
        },
        data: {
            reaction: body.reaction
        }
    })

    return { updated: true }

}

export const PATCH = validateRequest(async ({
    params,
    body,
    payloadSession
}) => {
    try {

        if (!payloadSession?.id)
            return NextResponse.json({ message: 'O id da sessão não está definido' }, { status: 400 })

        const user = await getSession(payloadSession.id)

        if (!user)
            return NextResponse.json({ message: 'A sessão não está definida' }, { status: 400 })

        const post = await prisma.post.findUnique({
            where: {
                id: params.id
            }
        });

        if(!post)
            return NextResponse.json({ message: 'Post não existe' }, { status: 400 })

        const findedPostReaction = await prisma.postReaction.findUnique({
            where: {
                post_id_user_id: {
                    post_id: params.id,
                    user_id: user.id
                }
            }
        })

        if(findedPostReaction) 
            await toggleReaction(findedPostReaction, body)
        else {
            try {
                await prisma.postReaction.create({
                    data: {
                        post_id: params.id,
                        user_id: user.id,
                        reaction: body.reaction    
                    },
                });
    
            } catch(e: any) {
                if(e.code === 'P2002') {
                    const post = await prisma.postReaction.findUnique({
                        where: {
                            post_id_user_id: {
                                post_id: params.id,
                                user_id: user.id
                            }
                        }
                    })

                    if(post)
                        await toggleReaction(post, body);
                }
            }
        }

        const query: PostReaction[] = await prisma.$queryRaw`
            select
                pr.post_id,

                COUNT(*) FILTER (WHERE pr.reaction = 'Like')::int  as like,
                COUNT(*) FILTER (WHERE pr.reaction = 'Smile')::int as smile,
                COUNT(*) FILTER (WHERE pr.reaction = 'Clap')::int  as clap,
                COUNT(*) FILTER (WHERE pr.reaction = 'Heart')::int as heart,

                MAX(pr.reaction) FILTER (WHERE pr.user_id = ${user.id}) 
                    as my_reaction

            from public.post_reaction pr
                where pr.post_id = ${params.id}
            group by pr.post_id
        `;

        let result = query[0];

        if(!result) {
            result = {
                like: 0,
                smile: 0,
                clap: 0,
                heart: 0,
                my_reaction: null
            }
        }


        return NextResponse.json(result)
    } catch (e) {
        console.log(e)
        return NextResponse.json({ message: 'Error' })
    }
}, reaction, idIsUUID,
    {
        type: 'session',
        secret: process.env.AUTH_SECRET!,
        completeTokenVar: 'token'
    }
)



export const GET = validateRequest(async ({
    params,
    body,
    payloadSession
}) => {
    try {

        if (!payloadSession?.id)
            return NextResponse.json({ message: 'O id da sessão não está definido' }, { status: 400 })

        const user = await getSession(payloadSession?.id)

        if (!user)
            return NextResponse.json({ message: 'A sessão não está definida' }, { status: 400 })

        const query: PostReaction[] = await prisma.$queryRaw`
            select
                pr.post_id,

                COUNT(*) FILTER (WHERE pr.reaction = 'Like')::int  as like,
                COUNT(*) FILTER (WHERE pr.reaction = 'Smile')::int as smile,
                COUNT(*) FILTER (WHERE pr.reaction = 'Clap')::int  as clap,
                COUNT(*) FILTER (WHERE pr.reaction = 'Heart')::int as heart,

                MAX(pr.reaction) FILTER (WHERE pr.user_id = ${user.id}) 
                    as my_reaction

            from public.post_reaction pr
                where pr.post_id = ${params.id}
            group by pr.post_id
        `;

        let result = query[0];

        if(!result) {
            result = {
                like: 0,
                smile: 0,
                clap: 0,
                heart: 0,
                my_reaction: null
            }
        }

        return NextResponse.json(result)
    } catch (e) {
        console.log(e)
        return NextResponse.json({ message: 'Error' })
    }
}, undefined, idIsUUID,
    {
        type: 'session',
        secret: process.env.AUTH_SECRET!,
        completeTokenVar: 'token'
    }
)


export type PostResponse = {
    like: number,
    smile: number,
    clap: number,
    heart: number,
    my_reaction: string | null
}