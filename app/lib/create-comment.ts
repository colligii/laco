import z from "zod";

export const createComment = z.object({
    comment: z.string({ message: 'Comentário não pode ser vazio e precisa ser uma string' })
})