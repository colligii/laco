import { z } from 'zod';

export const completeProfile = z.object({
    avatar: z
        .any()
        .refine(file => file instanceof File, 'O avatar precisa ser um arquivo')
        .refine(file => file.size > 0, 'O arquivo não pode estar vazio'),
    name: z
        .string({ message: 'O nome está invalido' })
        .nonempty({ message: 'O Nome não pode estar vazio. ' }),
    lastName: z
        .string({ message: 'A senha precisa ser definida' })
        .nonempty({ message: 'A senha não pode estar vazia' })
})

export type completeProfileType = z.infer<typeof completeProfile>