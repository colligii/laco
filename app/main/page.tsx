import React from 'react';
import { Clock, Users, MessageCircle } from 'lucide-react';

const ScheduleScreen = ({ 
  scheduleName = "Nome da Programação", 
  onlineCount = 12,
  events = [
    { id: 0, name: "Evento Exemplo", date: "12/12/2002 14:00:00" },
    { id: 1, name: "Evento Exemplo", date: "12/12/2002 14:00:00" }
  ] 
}) => {
  return (
    <div className="min-h-screen flex flex-col gap-8 bg-neutral-900 text-white font-sans relative pb-10">
      
      <div>
        <div className="relative h-[300px] w-full">
        <img 
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c" 
          alt="Couple" 
          className="w-full h-full object-cover"
        />
        {/* Overlay Escuro para Legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
        
        {/* Ícone de Chat */}
        <button className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
          <MessageCircle size={28} className="text-white" />
        </button>

        {/* Título Centralizado */}
        <div className="absolute bottom-20 w-full text-center">
          <h1 className="text-2xl font-semibold tracking-wide">
            {scheduleName}
          </h1>
        </div>
      </div>

      {/* Info Bar (Datas e Online) */}
      <div className="flex justify-around items-center px-4 -mt-10 mb-12 relative z-10">
        <div className="flex flex-col items-center gap-1">
          <Clock size={32} />
          <span className="text-[10px] uppercase opacity-70">Começa</span>
          <span className="text-xs font-light">23/01/01 00:00</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <Clock size={32} />
          <span className="text-[10px] uppercase opacity-70">Termina</span>
          <span className="text-xs font-light">23/01/01 00:00</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <Users size={32} />
          <span className="text-xs mt-4">Online: {onlineCount}</span>
        </div>
      </div>
      </div>

      {/* Carrossel / Lista de Cards */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar">
        {events.map((event) => (
          <div 
            key={event.id}
            className="relative w-screen min-w-screen max-w-screen h-[calc(100vh - 300px)] rounded-sm overflow-hidden flex items-center justify-center"
          >
            <div className=" relative w-3/5 aspect-[9/16] overflow-hidden border border-white/10 shrink-0">
                <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c" 
              alt="Event" 
              className="w-full h-full object-cover"
            />
            {/* Overlay do Card */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-4">
              <h2 className="text-xl font-bold mb-6 text-center">
                {event.name}
              </h2>
              <div className="flex items-center gap-2 text-[13px] opacity-90">
                <Clock size={16} />
                <span>Disponível a partir de:</span>
              </div>
              <p className="text-[13px] ml-6">{event.date}</p>
            </div>
            </div>
          </div>
        ))}
        
    </div>

    </div>
  );
};

export default ScheduleScreen;