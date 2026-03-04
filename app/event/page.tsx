import React from 'react';
import { ArrowLeft, MessageCircle, Plus, Clock } from 'lucide-react';

export default function EventPage({ eventName = "Nome do Evento" }) {
  // Dados mockados baseados na imagem
  const participants = [
    { id: 1, name: "Convidado", img: "https://github.com/shadcn.png", badge: true },
    { id: 2, name: "Convidado", img: "https://github.com/shadcn.png" },
    { id: 3, name: "Convidado", img: "https://github.com/shadcn.png" },
  ];

  const videos = Array(8).fill(null); // Simula os 8 vídeos da grade

  return (
    <div className="min-h-screen bg-[#222222] text-white flex flex-col font-sans">
      
      {/* Header */}
      <header className="flex items-center justify-between p-4 sticky top-0 bg-[#222222] z-10">
        <button className="p-2 bg-white/10 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-medium tracking-tight">{eventName}</h1>
        <button className="p-2 bg-white/10 rounded-full">
          <MessageCircle size={24} />
        </button>
      </header>

      {/* Seção de Convidados (Stories-like) */}
      <div className="flex gap-4 p-4 overflow-x-auto no-scrollbar items-start">
        {/* Botão de Adicionar */}
        <div className="flex flex-col items-center gap-2">
          <button className="w-16 h-16 bg-neutral-300 rounded-full flex items-center justify-center text-black">
            <Plus size={32} />
          </button>
          <span className="text-xs opacity-0">Spacer</span> {/* Mantém alinhamento */}
        </div>

        {participants.map((p) => (
          <div key={p.id} className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative">
              <img 
                src={p.img} 
                className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400 p-0.5" 
                alt={p.name} 
              />
              {p.badge && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border border-neutral-800">
                   <img src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" className="w-3 h-3" />
                </div>
              )}
            </div>
            <span className="text-xs font-light">{p.name}</span>
          </div>
        ))}
      </div>

      {/* Grid de Vídeos (2 colunas, 9:16) */}
      <div className="flex flex-wrap w-full p-1">
        {videos.map((_, index) => (
          <div 
            key={index} 
            className="w-1/2 aspect-[9/16] p-0.5 relative group"
          >
            <div className="w-full h-full relative overflow-hidden bg-neutral-800">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c" 
                className="w-full h-full object-cover opacity-80"
                alt="Video thumbnail"
              />
              
              {/* Overlay Inferior do Card */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-2">
                <div className="flex items-center gap-1">
                  <img src="https://github.com/shadcn.png" className="w-5 h-5 rounded-full border border-white" />
                  <span className="text-[10px] font-medium">Convidado</span>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <Clock size={12} />
                  <span>12s</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Barra de Navegação Inferior (Fixa) */}
      <footer className="fixed bottom-0 w-full mt-auto bg-[#333333] p-4 rounded-t-3xl flex justify-center border-t border-white/5">
        <div className="relative">
          <img 
            src="https://github.com/shadcn.png" 
            className="w-10 h-10 rounded-full border-2 border-cyan-400" 
            alt="Profile"
          />
        </div>
      </footer>
    </div>
  );
};
