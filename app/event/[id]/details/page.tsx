import React from 'react';
import { ArrowLeft, MessageCircle, Clock, Download, Send } from 'lucide-react';

const EventDetail = ({ selectedEventName = "Nome do Evento" }) => {
  const reactions = [
    { emoji: "👍", count: 12 },
    { emoji: "😁", count: 12 },
    { emoji: "👏", count: 12 },
    { emoji: "❤️", count: 12 },
  ];

  const comments = [
    { id: 1, user: "Convidado", text: "Casal lindo" },
    { id: 2, user: "Convidado", text: "Casal lindo" },
    { id: 3, user: "Convidado", text: "Casal lindo" },
  ];

  return (
    <div className="min-h-screen bg-[#222222] text-white flex flex-col font-sans">
      
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#222222]">
        <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-medium tracking-wide">
          {selectedEventName}
        </h1>
        <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
          <MessageCircle size={24} />
        </button>
      </header>

      {/* Media Player Area (Proporção aproximada da imagem) */}
      <div className="w-full bg-black relative">
        <img 
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c" 
          alt="Event Content"
          className="w-full h-auto object-contain"
        />
        
        {/* Floating Reactions Bar */}
        <div className="absolute bottom-4 left-4 flex gap-1 bg-black/40 backdrop-blur-sm p-1.5 rounded-full border border-white/10">
          {reactions.map((r, i) => (
            <div key={i} className="flex items-center gap-0.5 px-1">
              <span className="text-sm">{r.emoji}</span>
              <span className="text-[10px] opacity-80">{r.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* User Info Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src="https://github.com/shadcn.png" 
              className="w-10 h-10 rounded-full border border-white/20" 
              alt="Avatar"
            />
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-black">
               <img src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" className="w-2.5 h-2.5" alt="badge" />
            </div>
          </div>
          <span className="font-semibold text-sm">Convidado</span>
        </div>
        
        <div className="flex items-center gap-4 text-neutral-400">
          <button className="hover:text-white transition-colors">
            <Download size={20} />
          </button>
          <div className="flex items-center gap-1">
            <Clock size={18} />
            <span className="text-sm">12s</span>
          </div>
        </div>
      </div>

      {/* Comentários Section */}
      <div className="flex-1 px-4 mt-4">
        <h2 className="text-center text-xl font-bold mb-6 tracking-tight">Comentarios</h2>
        
        <div className="space-y-0.5">
          {comments.map((comment, index) => (
            <div 
              key={comment.id} 
              className="flex items-center gap-3 p-3 border border-white/30 bg-transparent"
            >
              <div className="relative shrink-0">
                <img src="https://github.com/shadcn.png" className="w-8 h-8 rounded-full" alt="User" />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-black">
                   <img src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" className="w-2 h-2" alt="badge" />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">{comment.user}</p>
                <p className="text-[11px] opacity-80">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input de Comentário Fixo */}
      <div className="p-4 flex items-center gap-3 bg-[#222222]">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Digite seu comentario"
            className="w-full bg-transparent border border-white/60 rounded-full py-3 px-6 text-sm focus:outline-none focus:border-white transition-all"
          />
        </div>
        <button className="bg-neutral-300 p-3 rounded-full text-black hover:bg-white transition-all">
          <Send size={24} fill="currentColor" />
        </button>
      </div>

    </div>
  );
};

export default EventDetail;