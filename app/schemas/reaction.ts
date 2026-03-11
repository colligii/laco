import { z } from 'zod';

export const reaction = z.object({
    reaction: z
        .enum(['Like','Smile','Clap','Heart'], { message: 'Reação não existe no banco de dados' })
})

export type reactionType = z.infer<typeof reaction>