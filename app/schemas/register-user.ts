import { z } from 'zod';

export const registerUser = z.object({
    email: z
        .email({ message: 'O e-mail está invalido' }),
    password: z
        .string({ message: 'A senha precisa ser definida' })
        .nonempty({ message: 'A senha não pode estar vazia' })
        .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/, { message: 'Senha preciso ter no mínimo oito caracteres, pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.' }),
    confirmPassword: z
        .string({ message: 'A confirmação da senha precisa ser definida' })
        .nonempty({ message: 'A confirmação da senha não pode estar vazia' })
})
.refine(({ password, confirmPassword}) => password == confirmPassword, {
    message: 'A senhas precisam ser iguais',
    path: ['confirmPassword']
})

export type registerUserType = z.infer<typeof registerUser>