import { Mail } from 'lucide-react';
import Button from '../components/button'
import ButtonIcon from '../components/button-icon'
import Header from '../components/header';
import AppleSvg from '../img/svg/apple';
import RegisterForm from './register-form';

const Login = () => {
    const scheduleName = "Casamento de [Nome]"; // Exemplo para a variável ${scheduleName}


    return (
        <>
            <Header disableIcon={true} />
            <div className="flex h-screen flex-col items-center justify-between text-white font-sans">

                <div className="flex flex-col items-center">
                    <h1 className="text-3xl font-bold mb-6 tracking-tight">
                        Registar
                    </h1>
                    <div>
                        <RegisterForm/>
                    </div>
                </div>


                <div className="w-full max-w-sm space-y-4">
                    <ButtonIcon
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
                    >
                    </ButtonIcon>
                    <ButtonIcon
                        color="white"
                        background="black"
                        borderColor="black"
                        iconComponent={
                            <AppleSvg width="25px" height="25px" />
                        }
                        text="Registre-se com Apple"
                    >
                    </ButtonIcon>

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