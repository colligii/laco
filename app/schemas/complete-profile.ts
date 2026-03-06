import { z } from 'zod';

export const completeProfile = z.object({
    avatar: z.file({ message: 'O avatar precisa ser um arquivo' }),
    name: z
        .string({ message: 'O nome está invalido' })
        .nonempty({ message: 'O Nome não pode estar vazio. '}),
    lastName: z
        .string({ message: 'A senha precisa ser definida' })
        .nonempty({ message: 'A senha não pode estar vazia' })
})

export type completeProfileType = z.infer<typeof completeProfile>