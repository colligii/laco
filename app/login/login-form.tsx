'use client'
import { useForm } from 'react-hook-form'
import { loginUser, type loginUserType } from '../schemas/login-user';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useLoading } from '../zustand/store';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    
    const { 
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<loginUserType>({
        resolver: zodResolver(loginUser)
    });
    const { setIsLoading } = useLoading();
    const router = useRouter();
    
    const onSubmit = (data: any) => {
        toast.promise(async () => {
            try {
                setIsLoading(true);
    
                await axios.post('/auth/login', data);
                setIsLoading(false);
                router.push('main');
    
            } catch(e) {
                setIsLoading(false);
                throw e;
            }
        }, {
            position: 'top-center',
            loading: 'Carregando',
            success: 'Usuário logado com sucesso',
            error: (err) => err?.response?.data?.message
        })
    }
    
    return (
        <form className="flex flex-col gap-2 w-90" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-1">
                <label className='text-sm' htmlFor='email'>E-mail:</label>
                <input placeholder="Digite seu e-mail" autoComplete='off' className="p-1.5 px-3 border-1 border-white rounded-full" {...register('email')}></input>
                { typeof errors.email?.message == 'string' && <span>{errors.email.message}</span>}
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-sm" htmlFor='password'>Senha:</label>
                <input placeholder="Digite sua senha" type="password" className="p-1.5 px-3 border-1 border-white rounded-full" {...register('password')}></input>
                { typeof errors.password?.message == 'string' && <span>{errors.password.message}</span>}
            </div>
            <div className="flex flex-col items-center justify-center">
                <button className='p-2 border-1 border-white rounded-full bg-blue-700 w-30' type="submit">Login</button>
            </div>
        </form>
    )
}
