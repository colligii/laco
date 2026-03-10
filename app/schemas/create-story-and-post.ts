import z from "zod";

export const createStoryAndPost = z.object({
    file_id: z.uuid({ message: 'O File id precisa ser um uuid' }),
    event_id: z.uuid({ message: 'O evento id precisa ser um uuid' })
})