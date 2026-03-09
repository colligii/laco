import z from "zod";

export const getStoryByUserId = z.object({
    userId: z.uuid({ message: 'Id precisa ser um UUID' })
})