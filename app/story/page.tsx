import React from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';

const StoryScreen = ({ eventName = "Nome do Evento", userName = "Convidado" }) => {
  const reactions = [
    { emoji: "👍", count: 12 },
    { emoji: "😁", count: 12 },
    { emoji: "👏", count: 12 },
    { emoji: "❤️", count: 12 },
  ];

  return (
    <div className="relative h-screen w-full bg-black flex flex-col font-sans overflow-hidden">
      
      {/* Background Image (O Story em si) */}
      <div className="absolute top-1/2 -translate-y-1/2 inset-0 z-0 max-h-100">
        <img 
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c" 
          className="w-full object-cover"
          alt="Story content"
        />
        {/* Overlay escuro superior para legibilidade do header */}
        <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-black/60 to-transparent" />
      </div>

      {/* Header do Story */}
      <div className="relative z-10 p-4 pt-6">
        {/* Barra de Progresso (Simulada) */}
        <div className="w-full h-1 bg-white/30 rounded-full mb-4 overflow-hidden">
          <div className="w-1/3 h-full bg-white rounded-full" /> {/* Progresso atual */}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
              <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-white font-medium text-sm leading-tight">
                {eventName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <img 
                  src="https://github.com/shadcn.png" 
                  className="w-6 h-6 rounded-full border border-white/50" 
                  alt="User"
                />
                <span className="text-white text-xs font-light">{userName}</span>
              </div>
            </div>
          </div>
          
          <button className="text-white p-2">
            <MoreVertical size={24} />
          </button>
        </div>
      </div>

      {/* Área de Interação Inferior */}
      <div className="mt-auto relative z-10 p-6 pb-10">
        
        {/* Reações Flutuantes (Estilo Pílula) */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-lg w-fit px-4 py-2 rounded-full border border-white/10 mb-4 mx-auto">
          {reactions.map((r, i) => (
            <div key={i} className="flex items-center gap-1 border-r border-white/10 last:border-none px-2">
              <span className="text-lg">{r.emoji}</span>
              <span className="text-[10px] text-white font-bold">{r.count}</span>
            </div>
          ))}
        </div>

        {/* Input de Resposta Rápida (Opcional, mas comum em stories) */}
        <div className="flex gap-3 items-center">
           <div className="flex-1 bg-transparent border border-white/40 rounded-full px-5 py-2.5 text-white/80 text-sm backdrop-blur-sm">
             Responder a {userName}...
           </div>
        </div>
      </div>

    </div>
  );
};

export default StoryScreen;