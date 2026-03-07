'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from './components/button';
import Header from './components/header';
import Loading from './components/loading';

const HomeContent = () => {
  const scheduleName = "Casamento de [Nome]"; // Exemplo para a variável ${scheduleName}
  const [isExiting, setIsExiting] = useState(false);
  const [targetHref, setTargetHref] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');

  const handleNavigate = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setTargetHref(href);
    setIsExiting(true);
  };

  const isFromBack = !!from;

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-zinc-950 text-white">

      {/* Slides left when exiting; enters from left if ?from=, else from top */}
      <motion.div
        className="w-full flex pb-8 h-full flex-col items-center overflow-hidden"
        initial={
          isFromBack
            ? { opacity: 0, x: '-100%' }
            : { opacity: 0, y: -60 }
        }
        animate={{
          opacity: 1,
          y: 0,
          x: isExiting ? '-100%' : 0,
        }}
        transition={{
          duration: isExiting ? 0.3 : 0.5,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        onAnimationComplete={() => {
          if (isExiting && targetHref) {
            router.push(targetHref);
          }
        }}
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
            <Link
              href="/login"
              className="block w-full min-h-[48px]"
              onClick={handleNavigate('/login')}
            >
              <Button>Login</Button>
            </Link>
            <Link
              href="/register"
              className="block w-full min-h-[48px]"
              onClick={handleNavigate('/register')}
            >
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

export default function Home() {
  return (
    <Suspense fallback={
      <div className="h-dvh flex flex-col overflow-hidden bg-zinc-950 text-white" />
    }>
      <HomeContent />
    </Suspense>
  );
}