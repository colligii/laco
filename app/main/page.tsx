'use client';

import { Suspense } from 'react';
import { Clock, MessageCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const MainContent = ({
  scheduleName = 'Nome da Programacao',
  onlineCount = 12,
  events = [
    { id: 0, name: 'Evento Exemplo', date: '12/12/2002 14:00:00' },
    { id: 1, name: 'Evento Exemplo', date: '12/12/2002 14:00:00' },
  ],
}) => {
  return (
    <div className="h-dvh overflow-hidden bg-zinc-950 text-white">
      <motion.div
        className="h-full flex flex-col overflow-hidden"
        initial={{ opacity: 0, x: '100%' }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="relative h-[270px] w-full shrink-0">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c"
            alt="Couple"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-transparent" />

          <button
            type="button"
            aria-label="Abrir chat"
            className="absolute right-5 top-5 rounded-full border border-zinc-700 bg-zinc-900/70 p-2 backdrop-blur-md"
          >
            <MessageCircle size={22} className="text-zinc-100" />
          </button>

          <div className="absolute bottom-14 w-full px-4 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {scheduleName}
            </h1>
          </div>
        </div>

        <div className="relative z-10 mx-4 -mt-8 mb-5 rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 backdrop-blur-sm">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-1 text-center">
              <Clock size={24} className="text-zinc-200" />
              <span className="text-[10px] uppercase text-zinc-500">Comeca</span>
              <span className="text-xs text-zinc-300">23/01/01 00:00</span>
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              <Clock size={24} className="text-zinc-200" />
              <span className="text-[10px] uppercase text-zinc-500">Termina</span>
              <span className="text-xs text-zinc-300">23/01/01 00:00</span>
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              <Users size={24} className="text-zinc-200" />
              <span className="text-[10px] uppercase text-zinc-500">Presenca</span>
              <span className="text-xs text-zinc-300">Online: {onlineCount}</span>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-x-auto no-scrollbar">
          <div className="flex h-full gap-6 px-6 pb-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="relative h-[88%] self-center w-[72vw] min-w-[72vw] max-w-sm shrink-0 overflow-hidden rounded-xl border border-zinc-800"
              >
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c"
                  alt="Event"
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4">
                  <h2 className="mb-5 text-xl font-semibold text-white">{event.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-zinc-200">
                    <Clock size={16} />
                    <span>Disponivel a partir de:</span>
                  </div>
                  <p className="pl-6 text-sm text-zinc-300">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function ScheduleScreen() {
  return (
    <Suspense
      fallback={
        <div className="h-dvh flex flex-col overflow-hidden bg-zinc-950 text-white" />
      }
    >
      <MainContent />
    </Suspense>
  );
}
