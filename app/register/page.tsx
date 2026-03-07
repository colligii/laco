'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '../components/header';
import RegisterForm from './register-form';
import GoogleLoginButton from '../components/google-login-button';
import Loading from '../components/loading';

const Register = () => {
  const [isExiting, setIsExiting] = useState(false);
  const [targetHref, setTargetHref] = useState('');
  const router = useRouter();

  const handleBackClick = (href: string) => {
    setTargetHref(href);
    setIsExiting(true);
  };

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-zinc-950 text-white">
      <Loading />
      <motion.div
        className="w-full flex flex-col flex-1 min-h-0 overflow-hidden"
        initial={{ opacity: 0, x: '100%' }}
        animate={{
          opacity: 1,
          x: isExiting ? '100%' : 0,
        }}
        transition={{
          duration: isExiting ? 0.3 : 0.4,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        onAnimationComplete={() => {
          if (isExiting && targetHref) {
            router.push(targetHref);
          }
        }}
      >
        <Header disableIcon={true} href="/?from=/register" onBackClick={handleBackClick} />

        <main className="flex-1 min-h-0 flex flex-col items-center justify-start pt-12 sm:pt-16 px-5 py-4 w-full max-w-sm mx-auto sm:px-6 sm:py-6 md:max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
            Registrar
          </h1>
          <p className="mt-3 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-[280px] sm:max-w-xs mx-auto">
            Crie sua conta para registrar suas memórias na caixa do tempo.
          </p>
        </div>

        <div className="w-full flex flex-col gap-20 space-y-12 sm:space-y-16">
          <RegisterForm />
          <GoogleLoginButton
            color="#18181b"
            background="white"
            iconComponent={
              <img
                src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
                alt="Google"
                className="w-6 h-6"
              />
            }
            text="Registre-se com Google"
          />
        </div>

        <p className="mt-6 text-sm text-zinc-500 text-center">
          <a href="#" className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2">
            Precisa de ajuda?
          </a>
        </p>
        </main>

        <footer className="flex-shrink-0 pt-4 pb-8">
          <p className="text-center text-xs text-zinc-600">
            Etapa 1 de 2 — Laços
          </p>
        </footer>
      </motion.div>
    </div>
  );
};

export default Register;
