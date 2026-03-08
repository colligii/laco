'use client'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Camera } from 'lucide-react';
import { completeProfile, completeProfileType } from '../schemas/complete-profile';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios'
import { ImageCropperModal } from '../components/image-cropper-modal';
import { useLoading } from '../zustand/store';
import { toast } from 'sonner';

export default function ProfileUploadForm({ firstName, lastName }: ProfileUploadForm) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [finalImage, setFinalImage] = useState<string | null>(null);
    const { setIsLoading } = useLoading();

    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors }
    } = useForm<completeProfileType>({
        resolver: zodResolver(completeProfile),
        defaultValues: {
            name: firstName,
            lastName: lastName
        }
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => setSelectedImage(reader.result as string);
        }
    };

    const onSubmit = (data: any) => {
        toast.promise(async () => {
            try {
                setIsLoading(true);
    
                const formData = new FormData();
    
                formData.append("file", data.avatar);
    
                await axios.post('/api/s3/user/upload/avatar', formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                })
    
                await axios.patch('/api/user/complete-profile', {
                    firstName: data.name,
                    lastName: data.lastName
                })
    
                window.location.pathname = ('/auth/exchange-token');
    
                setIsLoading(false);
            } catch (e) {
                setIsLoading(false);
            }
        }, {
            position: 'top-center',
            success: 'Usuário atualizado com sucesso',
            error: (err) => err?.response?.data?.message
        })
        
    }

    const cropComplete = async (img: string) => {
        setFinalImage(img);
        
        setIsLoading(true);        

        const response = await fetch(img);
        const blob = await response.blob();
        const file = new File([blob], 'finish-img', { type: blob.type })
        
        setIsLoading(false);
        setValue('avatar', file);
    }

    return (
        <form className="flex flex-col gap-4 w-80" onSubmit={handleSubmit(onSubmit)}>
            {/* Image Upload Circle */}
            <div className="flex flex-col items-center gap-2">
                <label htmlFor="profile-pic" className="relative cursor-pointer group">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center overflow-hidden bg-gray-800">
                        {finalImage ? (
                            <img src={finalImage} alt="Preview" className="w-full h-full object-cover" />
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
                {errors.avatar && <span className="text-red-400 text-xs">{errors.avatar.message as string}</span>}
            </div>

            <div className="flex flex-col gap-1">
                <label className='text-sm' htmlFor='firstName'>Nome:</label>
                <input
                    placeholder="Seu primeiro nome"
                    className="p-1.5 px-3 bg-transparent border border-white rounded-full text-white outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('name', { required: "Nome é obrigatório" })}
                />
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
            <ImageCropperModal
                image={selectedImage}
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                onCropComplete={cropComplete}
            />
        </form>
    )
}

export interface ProfileUploadForm {
    firstName?: string,
    lastName?: string
}