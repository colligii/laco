'use client'

import { useLoading } from "../zustand/store";

export default function Loading() {

    const { isLoading } = useLoading();

    return (
        <>
            {isLoading && (
                <div className="h-screen absolute w-full z-10 flex flex-col items-center justify-center bg-[rgba(0,0,0,0.9)] text-white">
                    <div className="relative">
                        <div className="w-12 h-12 border-2 border-gray-700 rounded-full" />
                        <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-white rounded-full animate-spin" />
                    </div>
                    <p className="mt-4 text-sm text-gray-400 animate-pulse">Carregando...</p>
                </div>
            )}
        </>
    );
}
