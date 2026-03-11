import z from "zod";

export const createMessage = z.object({
    id: z.uuid({ message: 'O id precisa ser um uuid' }),
    event_id: z.uuid({ message: 'O evento id precisa ser um uuid' }),
    message: z.string({ message: 'a Mensagem precisa ser uma string' }),
    user_id: z.uuid({ message: 'User id precisa ser uma string'})
})