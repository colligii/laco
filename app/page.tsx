'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from './components/button';
import Header from './components/header';
import Loading from './components/loading';

const Home = () => {
  const scheduleName = "Casamento de [Nome]"; // Exemplo para a variável ${scheduleName}

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-zinc-950 text-white">
      <motion.div
        className="w-full flex pb-8 h-full flex-col items-center"
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Loading />
        <Header disableBackBtn={true} />

        <main className="flex-1 min-h-0 flex flex-col items-center justify-center px-5 py-4 w-full max-w-sm mx-auto sm:px-6 sm:py-6 md:max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-white">
              Laços
            </h1>
            <p className="mt-3 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-[280px] sm:max-w-xs mx-auto">
              Entre em{' '}
              <span className="font-medium text-white">{scheduleName}</span>{' '}
              e registre suas memórias na caixa do tempo.
            </p>
          </div>

          <div className="w-full space-y-3">
            <Link href="/login" className="block w-full min-h-[48px]">
              <Button>Login</Button>
            </Link>
            <Link href="/register" className="block w-full min-h-[48px]">
              <Button background="#4f46e5">Registrar</Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-zinc-500 text-center">
            <a href="#" className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2">
              Precisa de ajuda?
            </a>
          </p>
        </main>

      <motion.footer
        className="flex-shrink-0 pt-4 pb-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="text-center text-xs text-zinc-600">
            Laços — memórias que conectam
          </p>
        </motion.footer>
      </motion.div>
    </div>
  );
};

export default Home;