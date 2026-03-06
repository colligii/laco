import Header from '../components/header';
import ProfileUploadForm from './profile-upload-form'

const UploadProfile = () => {
    return (
        <div className="h-screen flex flex-col items-center bg-black text-white">
            <Header disableIcon={true} href="/register"/>
            
            <main className="flex-1 flex flex-col items-center justify-center px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Complete seu Perfil</h1>
                    <p className="text-gray-400 mt-2">Adicione uma foto e seu nome para continuar</p>
                </div>

                <ProfileUploadForm />
            </main>

            <footer className="pb-10">
                <div className="flex items-center gap-2 opacity-70">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <span className="text-xs uppercase tracking-widest">Etapa 2 de 2</span>
                </div>
            </footer>
        </div>
    );
};

export default UploadProfile;