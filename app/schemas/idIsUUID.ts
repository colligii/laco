import z from "zod";

export const idIsUUID = z.object({
    id: z.uuid({ message: 'Id precisa ser um UUID' })
})