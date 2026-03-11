import { cloudfrontGetSignedUrl } from "@/app/lib/cloudFrontgetSignedUrl";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/redis";
import { validateRequest } from "@/app/lib/validateRequest";
import { idIsUUID } from "@/app/schemas/idIsUUID";
import { reaction, reactionType } from "@/app/schemas/reaction";
import { StoryReactionModel } from "@/prisma/app/generated/prisma/models";
import { NextRequest, NextResponse } from "next/server";
import { URL } from "url";

export async function toggleReaction(storyReaction: StoryReactionModel, body: reactionType) {
    if(storyReaction.reaction === body.reaction) {
        await prisma.storyReaction.delete({
            where: {
                story_id_user_id: {
                    story_id: storyReaction.story_id,
                    user_id: storyReaction.user_id
                }
            }
        });

        return { deleted: true }
    }

    await prisma.storyReaction.update({
        where: {
            story_id_user_id: {
                story_id: storyReaction.story_id,
                user_id: storyReaction.user_id
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

        const user = await getSession(payloadSession?.id);

        if (!user)
            return NextResponse.json({ message: 'A sessão não está definida' }, { status: 400 })

        const story = await prisma.story.findUnique({
            where: {
                id: params.id
            }
        });

        if(!story)
            return NextResponse.json({ message: 'Story não existe' }, { status: 400 })

        const findedStoryReaction = await prisma.storyReaction.findUnique({
            where: {
                story_id_user_id: {
                    story_id: params.id,
                    user_id: user.id
                }
            }
        })

        if(findedStoryReaction) 
            await toggleReaction(findedStoryReaction, body)
        else {
            try {
                await prisma.storyReaction.create({
                    data: {
                        story_id: params.id,
                        user_id: user.id,
                        reaction: body.reaction    
                    },
                });
    
            } catch(e: any) {
                if(e.code === 'P2002') {
                    const reaction = await prisma.storyReaction.findUnique({
                        where: {
                            story_id_user_id: {
                                story_id: params.id,
                                user_id: user.id
                            }
                        }
                    })

                    if(reaction)
                        await toggleReaction(reaction, body);
                }
            }
        }

        const query: StoryResponse[] = await prisma.$queryRaw`
            select
                sr.story_id,

                COUNT(*) FILTER (WHERE sr.reaction = 'Like')::int  as like,
                COUNT(*) FILTER (WHERE sr.reaction = 'Smile')::int as smile,
                COUNT(*) FILTER (WHERE sr.reaction = 'Clap')::int  as clap,
                COUNT(*) FILTER (WHERE sr.reaction = 'Heart')::int as heart,

                MAX(sr.reaction) FILTER (WHERE sr.user_id = ${user.id}) 
                    as my_reaction

            from public.story_reaction sr
                where sr.story_id = ${params.id}
            group by sr.story_id
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

export type StoryResponse = {
    like: number,
    smile: number,
    clap: number,
    heart: number,
    my_reaction: string | null
}