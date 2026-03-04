import { z } from 'zod';

export const loginUser = z.object({
    email: z
        .email({ message: 'O e-mail está invalido' }),
    password: z
        .string({ message: 'A senha precisa ser definida' })
        .nonempty({ message: 'A senha não pode estar vazia' })
})

export type loginUserType = z.infer<typeof loginUser>