import z from "zod";

export const createFile = z.object({
    fileType: z.enum(['video', 'photo'], { message: 'Video ou foto fazendo o upload' }),
    type: z.enum(['post', 'story'], { message: 'Tipo do post não encontrado' })
})