import Header from '@/app/components/header';
import Link from 'next/link';

export default function ErrorAuth() {
    return (
        <div className="h-screen flex flex-col items-center bg-black text-white">
            <Header disableIcon={true} href="/login" />
            
            <main className="flex-1 flex flex-col items-center justify-center px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Algo deu errado</h1>
                    <p className="text-gray-400 mt-2">Ocorreu um erro ao autenticar. Tente novamente.</p>
                </div>

                <Link
                    href="/login"
                    className="px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition-colors"
                >
                    Tentar novamente
                </Link>
            </main>

            <footer className="pb-10">
                <div className="flex items-center gap-2 opacity-70">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <span className="text-xs uppercase tracking-widest">Erro de autenticação</span>
                </div>
            </footer>
        </div>
    );
}
