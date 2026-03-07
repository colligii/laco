import { z } from 'zod';

export const patchUser = z.object({
    firstName: z
        .string({ message: 'O primeiro nome precisa ser definida' })
        .nonempty({ message: 'O primeiro nome não pode estar vazia' }),
    lastName: z
        .string({ message: 'O ultimo nome precisa ser definida' })
        .nonempty({ message: 'O ultimo nome não pode estar vazia' })
})

export type patchUserType = z.infer<typeof patchUser>