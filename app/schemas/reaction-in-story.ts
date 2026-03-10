import { z } from 'zod';

export const reactionInStory = z.object({
    reaction: z
        .enum(['Like','Smile','Clap','Heart'], { message: 'Reação não existe no banco de dados' })
})

export type reactionInStoryType = z.infer<typeof reactionInStory>