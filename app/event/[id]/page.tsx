import React from 'react';
import { ArrowLeft, MessageCircle, Plus, Clock } from 'lucide-react';
import useMakeBackendRequest from '@/app/lib/makeBackendRequest';

interface PageProps {
  params: { id: string }
}

export default async function EventPage({ params }: PageProps) {
  
  const paramsResolved = await params;

  const event = await useMakeBackendRequest(`/api/event/${paramsResolved.id}`)
  const me = await useMakeBackendRequest('/api/user/me');

  const participants = [
    { id: 1, name: 'Convidado', img: 'https://github.com/shadcn.png', badge: true },
    { id: 2, name: 'Convidado', img: 'https://github.com/shadcn.png' },
    { id: 3, name: 'Convidado', img: 'https://github.com/shadcn.png' },
  ];

  const videos = Array(8).fill(null);

  return (
    <div className="h-dvh bg-zinc-950 text-white flex flex-col overflow-hidden">
      <div className="w-full max-w-md mx-auto flex flex-col flex-1 min-h-0">
        <header className="flex items-center justify-between px-5 sm:px-6 py-4 sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
          <button className="p-2 bg-zinc-900/70 hover:bg-zinc-800 transition-colors rounded-full border border-zinc-800">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white text-center truncate px-3">
            {event.name}
          </h1>
          <button className="p-2 bg-zinc-900/70 hover:bg-zinc-800 transition-colors rounded-full border border-zinc-800">
            <MessageCircle size={20} />
          </button>
        </header>

        <div className="flex gap-4 px-5 sm:px-6 py-4 overflow-x-auto no-scrollbar items-start">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <button className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-950 shadow-sm">
              <Plus size={28} />
            </button>
            <span className="text-xs text-zinc-500 opacity-0">Spacer</span>
          </div>

          {participants.map((p) => (
            <div key={p.id} className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative">
                <img
                  src={p.img}
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/80 p-0.5"
                  alt={p.name}
                />
                
              </div>
              <span className="text-xs text-zinc-300 font-normal">{p.name}</span>
            </div>
          ))}
        </div>

        <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 pb-24">
          <div className="grid grid-cols-4 auto-rows-[90px] sm:auto-rows-[100px] gap-2">
            {videos.map((_, index) => {
              const pattern = index % 6;
              const tileClass =
                pattern === 0
                  ? 'col-span-2 row-span-2'
                  : pattern === 1
                    ? 'col-span-2 row-span-1'
                    : pattern === 2
                      ? 'col-span-1 row-span-2'
                      : pattern === 3
                        ? 'col-span-1 row-span-1'
                        : pattern === 4
                          ? 'col-span-1 row-span-1'
                          : 'col-span-2 row-span-1';

              return (
                <div key={index} className={`${tileClass} relative group`}>
                <div className="w-full h-full relative overflow-hidden bg-zinc-900 rounded-xl border border-zinc-800">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c"
                    className="w-full h-full object-cover opacity-80"
                    alt="Video thumbnail"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex items-end justify-between p-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <img
                        src="https://github.com/shadcn.png"
                        className="w-5 h-5 rounded-full border border-white/80 shrink-0"
                        alt="Convidado"
                      />
                      <span className="text-[10px] text-zinc-100 font-medium truncate">Convidado</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-200 shrink-0">
                      <Clock size={11} />
                      <span>12s</span>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 py-4">
        <div className="w-full max-w-md mx-auto flex justify-center">
          <div className="relative">
            <img
              src={me.avatar_url}
              className="w-10 h-10 rounded-full border-2 border-indigo-500/80"
              alt="Profile"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
