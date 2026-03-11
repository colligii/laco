'use client'

import React, { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';

const ChatScreen = ({ selectedEventName = "Nome do Evento" }) => {
  const [message, setMessage] = useState("");

  const chatMessages = [
    {
      id: 1,
      user: "Convidado",
      text: "Casal lindo",
      isMe: false,
      avatar: "https://github.com/shadcn.png"
    },
    {
      id: 2,
      user: "Convidado",
      text: "Casal lindo",
      isMe: true,
      avatar: "https://github.com/shadcn.png"
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-[#222222] text-white font-sans">
      
      {/* Header */}
      <header className="relative flex items-center justify-center p-4">
        <button className="absolute left-4 p-3 bg-neutral-100 rounded-full text-black hover:bg-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        
        <div className="text-center">
          <h1 className="text-xl font-semibold">{selectedEventName}</h1>
          <h2 className="text-2xl font-bold mt-4 tracking-tight">Chat</h2>
        </div>
      </header>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatMessages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              flex items-center gap-3 p-3 max-w-[80%]
              ${msg.isMe 
                ? 'bg-[#5D5FEF] border-none rounded-lg' 
                : 'bg-transparent border border-white/40 rounded-sm'}
            `}>
              {/* Avatar com Badge (🐔) para o remetente */}
              {!msg.isMe && (
                <div className="relative shrink-0">
                  <img src={msg.avatar} className="w-8 h-8 rounded-full" alt="User" />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-black">
                    <span className="text-[8px]">🐔</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col">
                <span className="text-[10px] font-bold leading-none mb-1">
                  {msg.user}
                </span>
                <span className="text-xs font-light">
                  {msg.text}
                </span>
              </div>

              {/* Avatar para mensagens enviadas por mim */}
              {msg.isMe && (
                <div className="relative shrink-0">
                  <img src={msg.avatar} className="w-8 h-8 rounded-full border border-white/20" alt="Me" />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-black">
                    <span className="text-[8px]">🐔</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input de Mensagem Fixo */}
      <footer className="p-6 pb-10 flex items-center gap-3">
        <div className="flex-1 relative">
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem"
            className="w-full bg-transparent border border-white/80 rounded-full py-3.5 px-6 text-sm focus:outline-none focus:border-white transition-all placeholder:text-white/60"
          />
        </div>
        <button className="bg-neutral-100 p-4 rounded-full text-black hover:bg-white transition-transform active:scale-95">
          <Send size={24} fill="currentColor" />
        </button>
      </footer>

    </div>
  );
};

export default ChatScreen;