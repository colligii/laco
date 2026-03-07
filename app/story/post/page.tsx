'use client'

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const CameraScreen = ({ selectedEventName = "Nome do Evento" }) => {
  const videoRef:any = useRef(null);
  const [stream, setStream]: any = useState(null);
  const [error, setError]: any = useState(null);
  const [activeTab, setActiveTab] = useState('Feed');

  // Função para solicitar e iniciar a câmera
  const startCamera = async () => {
    try {
      const mediaStream:any = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', aspectRatio: 16/9 }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      setError("Permissão de câmera negada ou não encontrada.");
    }
  };

  useEffect(() => {
    startCamera();
    // Limpeza ao fechar a tela
    return () => {
      if (stream) {
        stream.getTracks().forEach((track: any) => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative h-screen w-full bg-[#222222] text-white flex flex-col overflow-hidden font-sans">
      
      {/* Header Fixo */}
      <header className="relative z-20 flex items-center justify-between p-4 bg-transparent">
        <button className="p-3 bg-white/20 backdrop-blur-md rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-medium tracking-tight">
          {selectedEventName}
        </h1>
        <div className="w-12" /> {/* Spacer para equilibrar o título */}
      </header>

      {/* Viewport da Câmera */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-center p-6">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={startCamera}
              className="px-6 py-2 bg-white text-black rounded-full font-bold"
            >
              Tentar Novamente
            </button>
          </div>
        ) : (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* Overlay de Filtros (Simulado) */}
        <div className="absolute bottom-24 w-full flex justify-center gap-6 items-end pb-8">
          {/* Círculo de Filtro Vazio */}
          <div className="w-16 h-16 rounded-full bg-neutral-300/30 border-2 border-white/50 backdrop-blur-sm" />
          
          {/* Botão de Captura (Filtro Selecionado) */}
          <div className="flex flex-col items-center gap-2">
            <button className="w-20 h-20 rounded-full bg-neutral-300 flex items-center justify-center text-black border-4 border-white shadow-xl transform active:scale-95 transition-transform">
              <span className="text-xs font-bold leading-none text-center">Filtro<br/>1</span>
            </button>
          </div>

          {/* Botão de Trocar Câmera */}
          <button 
            onClick={() => {/* Lógica para inverter facingMode */}}
            className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-md border border-white/20"
          >
            <RefreshCw size={24} />
          </button>
        </div>
      </div>

      {/* Seletor de Modo (Bottom Bar) */}
      <div className="relative z-20 pb-8 flex justify-center">
        <div className="flex bg-black/40 backdrop-blur-xl rounded-full p-1 border border-white/10">
          {['Feed', 'Stories', 'QR'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === tab 
                ? 'bg-white text-black' 
                : 'text-white/60 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CameraScreen;