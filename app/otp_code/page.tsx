import { Mail } from 'lucide-react';
import Button from '../components/button'
import ButtonIcon from '../components/button-icon'
import Header from '../components/header';
import AppleSvg from '../img/svg/apple';
import OtpCodeForm from './otp-code-form';

const Login = () => {
    const email = "email@email.com"; // Exemplo para a variável ${scheduleName}


    return (
        <>
            <Header disableIcon={true} />
            <div className="flex h-screen flex-col items-center justify-between text-white font-sans">

                <div className="flex flex-col items-center w-100">
                    <div className="flex flex-col gap-3 pb-3 text-center">
                        <h1 className="text-3xl font-bold mb-6 tracking-tight">
                            OTP Code
                        </h1>
                        <span>
                            <b>Enviamos um codigo de verificação:</b><br/>
                            Enviamos um codigo de verificação para o e-mail {email} confirme ele
                        </span>
                    </div>
                    <div className="flex items-center justify-center">
                        <OtpCodeForm/>
                    </div>
                </div>


                <div className="w-full max-w-sm space-y-4">
                    <div className="flex items-center justify-center gap-4 pt-6">
                        <div className="text-4xl font-black">
                            ?
                        </div>
                        <p className="text-sm">
                            Ficou com dúvida! <a href="#" className="text-blue-500 hover:underline">Clique Aqui</a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;