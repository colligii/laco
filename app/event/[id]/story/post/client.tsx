'use client'

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const MAX_RECORDING_MS = 60 * 1000;

declare global {
  interface Window {
    __storyDraft?: {
      kind: 'photo' | 'video';
      mimeType: string;
      blob: Blob;
      createdAt: number;
    };
  }
}

const CameraScreen = ({ selectedEventName, eventId }: { selectedEventName: string; eventId: string }) => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const capturedPhotoUrlRef = useRef<string | null>(null);
  const recordedVideoUrlRef = useRef<string | null>(null);
  const capturedPhotoBlobRef = useRef<Blob | null>(null);
  const recordedVideoBlobRef = useRef<Blob | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Photo' | 'Record'>('Photo');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isRecording, setIsRecording] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(60);

  const clearRecordingTimeout = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  };

  const fileToDataUrl = (file: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }
        reject(new Error('Falha ao converter arquivo para base64'));
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const saveDraftAndGoDetail = async (payload: { kind: 'photo' | 'video'; blob: Blob; mimeType: string }) => {
    try {
      window.__storyDraft = {
        kind: payload.kind,
        mimeType: payload.mimeType,
        blob: payload.blob,
        createdAt: Date.now(),
      };

      if (payload.kind === 'photo') {
        const dataUrl = await fileToDataUrl(payload.blob);
        sessionStorage.setItem(
          'story-draft',
          JSON.stringify({
            kind: payload.kind,
            mimeType: payload.mimeType,
            dataUrl,
            createdAt: Date.now(),
          })
        );
      }

      router.push(`/event/${eventId}/story/detail`);
    } catch (draftError) {
      console.error('Erro ao salvar rascunho:', draftError);
      setError('Falha ao abrir tela de detalhes.');
    }
  };

  const stopCurrentStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    try {
      stopCurrentStream();
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, aspectRatio: 9 / 16 },
        audio: true,
      });
      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setFacingMode(mode);
      setError(null);
      return true;
    } catch (err) {
      console.error('Erro ao acessar a câmera:', err);
      setError('Permissão de câmera negada ou não encontrada.');
      return false;
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const sourceWidth = video.videoWidth;
    const sourceHeight = video.videoHeight;
    const viewportWidth = video.clientWidth;
    const viewportHeight = video.clientHeight;
    if (!sourceWidth || !sourceHeight || !viewportWidth || !viewportHeight) return;

    // Crop the source frame using the same "object-cover" framing shown on screen.
    const sourceAspect = sourceWidth / sourceHeight;
    const viewportAspect = viewportWidth / viewportHeight;

    let cropX = 0;
    let cropY = 0;
    let cropWidth = sourceWidth;
    let cropHeight = sourceHeight;

    if (sourceAspect > viewportAspect) {
      cropWidth = sourceHeight * viewportAspect;
      cropX = (sourceWidth - cropWidth) / 2;
    } else {
      cropHeight = sourceWidth / viewportAspect;
      cropY = (sourceHeight - cropHeight) / 2;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(cropWidth);
    canvas.height = Math.round(cropHeight);

    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(
      video,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      if (capturedPhotoUrlRef.current) {
        URL.revokeObjectURL(capturedPhotoUrlRef.current);
      }
      const newUrl = URL.createObjectURL(blob);
      capturedPhotoUrlRef.current = newUrl;
      capturedPhotoBlobRef.current = blob;
      setCapturedPhotoUrl(newUrl);
      await saveDraftAndGoDetail({ kind: 'photo', blob, mimeType: 'image/jpeg' });
    }, 'image/jpeg', 0.95);
  };

  const startRecording = () => {
    if (!streamRef.current || isRecording) return;

    try {
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
        setRecordedVideoUrl(null);
        recordedVideoUrlRef.current = null;
      }

      const mediaRecorder = new MediaRecorder(streamRef.current);
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        if (recordedVideoUrlRef.current) {
          URL.revokeObjectURL(recordedVideoUrlRef.current);
        }
        const newUrl = URL.createObjectURL(blob);
        recordedVideoUrlRef.current = newUrl;
        recordedVideoBlobRef.current = blob;
        setRecordedVideoUrl(newUrl);
        void saveDraftAndGoDetail({ kind: 'video', blob, mimeType: 'video/webm' });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRemainingSeconds(60);
      clearRecordingTimeout();
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          setError('Limite de 1 minuto atingido. O vídeo foi finalizado.');
          stopRecording();
        }
      }, MAX_RECORDING_MS);
    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      setError('Não foi possível iniciar a gravação.');
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    clearRecordingTimeout();
  };

  const handleCapture = () => {
    if (activeTab === 'Photo') {
      takePhoto();
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSwitchCamera = async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    const switched = await startCamera(nextMode);
    if (!switched) {
      // Keep current camera if alternate one isn't available.
      setError('Essa câmera não está disponível. Mantendo a câmera atual.');
      await startCamera(facingMode);
    } 
  };

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', aspectRatio: 9 / 16 },
          audio: true,
        });
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Erro ao acessar a câmera:', err);
        setError('Permissão de câmera negada ou não encontrada.');
      }
    };

    void initializeCamera();

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      stopCurrentStream();
      if (capturedPhotoUrlRef.current) {
        URL.revokeObjectURL(capturedPhotoUrlRef.current);
      }
      if (recordedVideoUrlRef.current) {
        URL.revokeObjectURL(recordedVideoUrlRef.current);
      }
      clearRecordingTimeout();
    };
  }, []);

  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) return 0;
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

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
              onClick={() => startCamera(facingMode)}
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
          {/* <div className="w-16 h-16 rounded-full bg-neutral-300/30 border-2 border-white/50 backdrop-blur-sm" /> */}
          
          {/* Botão de Captura (Filtro Selecionado) */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleCapture}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-black border-4 border-white shadow-xl transform active:scale-95 transition-transform ${
                isRecording ? 'bg-red-500 text-white' : 'bg-neutral-300'
              }`}
            >
              <span className="text-sm font-bold leading-none text-center">
                {activeTab === 'Photo' ? 'Foto' : isRecording ? 'Parar' : 'Gravar'}
              </span>
            </button>
            {activeTab === 'Record' && (
              <span className="text-[11px] text-white/80">
                {isRecording ? `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, '0')}` : 'max 1:00'}
              </span>
            )}
          </div>

          {/* Botão de Trocar Câmera */}
          <button 
            onClick={handleSwitchCamera}
            className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-md border border-white/20"
          >
            <RefreshCw size={24} />
          </button>
        </div>
      </div>

      {/* Seletor de Modo (Bottom Bar) */}
      <div className="relative z-20 pb-8 flex justify-center">
        <div className="flex bg-black/40 backdrop-blur-xl rounded-full p-1 border border-white/10">
          {['Photo', 'Record'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'Photo' | 'Record')}
              className={`px-5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === tab 
                ? 'bg-white text-black' 
                : 'text-white/60 hover:text-white'
              }`}
            >
              {tab === 'Photo' ? 'Foto' : 'Video'}
            </button>
          ))}
        </div>
      </div>

      {capturedPhotoUrl && (
        <img
          src={capturedPhotoUrl}
          alt="Última foto capturada"
          className="absolute left-4 bottom-24 z-30 w-16 h-16 rounded-md object-cover border border-white/30"
        />
      )}

      {recordedVideoUrl && (
        <video
          src={recordedVideoUrl}
          className="absolute right-4 bottom-24 z-30 w-20 h-14 rounded-md object-cover border border-white/30"
          muted
          loop
          autoPlay
        />
      )}

    </div>
  );
};

export default CameraScreen;
