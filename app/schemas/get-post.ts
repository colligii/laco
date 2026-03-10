import z from "zod";

export const getPost = z.object({
    postId: z.uuid({ message: 'O Post id precisa ser um uuid' }).nullish(),
    eventId: z.uuid({ message: 'O evento id precisa ser um uuid' }),
    createdAt: z.string({ message: 'Data de criação precisa ser uma string' }).datetime({ message: 'Data de criação precisa ser um datetime' }).nullish()
})