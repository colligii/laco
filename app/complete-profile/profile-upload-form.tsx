'use client'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Camera } from 'lucide-react';
import { completeProfile, completeProfileType } from '../schemas/complete-profile';
import { zodResolver } from '@hookform/resolvers/zod';

export default function ProfileUploadForm() {
    const [preview, setPreview] = useState<string | null>(null);
    
    const { 
        register,
        handleSubmit, 
        formState: { errors }
    } = useForm<completeProfileType>({
        resolver: zodResolver(completeProfile)
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = (data: any) => {
        console.log(data);
    }

    return (
        <form className="flex flex-col gap-4 w-80" onSubmit={handleSubmit(onSubmit)}>
            {/* Image Upload Circle */}
            <div className="flex flex-col items-center gap-2">
                <label htmlFor="profile-pic" className="relative cursor-pointer group">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center overflow-hidden bg-gray-800">
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <Camera className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
                        )}
                    </div>
                    <input 
                        id="profile-pic"
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        {...register('avatar')}
                        onChange={handleImageChange}
                    />
                </label>
                <span className="text-xs text-gray-400">Clique para carregar foto</span>
            </div>

            <div className="flex flex-col gap-1">
                <label className='text-sm' htmlFor='firstName'>Nome:</label>
                <input 
                    placeholder="Seu primeiro nome" 
                    className="p-1.5 px-3 bg-transparent border border-white rounded-full text-white outline-none focus:ring-2 focus:ring-blue-500" 
                    {...register('name', { required: "Nome é obrigatório" })}
                />
                {errors.name && <span className="text-red-400 text-xs">{errors.name.message as string}</span>}
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm" htmlFor='lastName'>Sobrenome:</label>
                <input 
                    placeholder="Seu sobrenome" 
                    className="p-1.5 px-3 bg-transparent border border-white rounded-full text-white outline-none focus:ring-2 focus:ring-blue-500" 
                    {...register('lastName', { required: "Sobrenome é obrigatório" })}
                />
                {errors.lastName && <span className="text-red-400 text-xs">{errors.lastName.message as string}</span>}
            </div>

            <div className="flex flex-col items-center pt-4">
                <button 
                    className='p-2 bg-blue-700 hover:bg-blue-600 transition-colors rounded-full w-full font-bold' 
                    type="submit"
                >
                    Salvar Perfil
                </button>
            </div>
        </form>
    )
}