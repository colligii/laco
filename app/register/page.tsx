import Header from '../components/header';
import RegisterForm from './register-form';
import GoogleLoginButton from '../components/google-login-button';

const Register = () => {
    return (
        <div className="h-screen flex flex-col items-center bg-black text-white">
            <Header disableIcon={true} href="/" />
            
            <main className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Registrar</h1>
                    <p className="text-gray-400 mt-2">Crie sua conta para continuar</p>
                </div>

                <div className="w-full space-y-4">
                    <RegisterForm />
                    <GoogleLoginButton
                        color="black"
                        background="white"
                        iconComponent={
                            <img
                                src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
                                alt="Google"
                                className="w-7 h-7"
                            />
                        }
                        text="Registre-se com Google"
                    />
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <div className="text-4xl font-black">?</div>
                        <p className="text-sm text-gray-400">
                            Ficou com dúvida? <a href="#" className="text-blue-400 hover:underline">Clique aqui</a>
                        </p>
                    </div>
                </div>
            </main>

            <footer className="pb-10">
                <div className="flex items-center gap-2 opacity-70">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <span className="text-xs uppercase tracking-widest">Etapa 1 de 2</span>
                </div>
            </footer>
        </div>
    );
};

export default Register;
