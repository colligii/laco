'use client'

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const MAX_RECORDING_MS = 60 * 1000;

declare global {
  interface Window {
    __postDraft?: {
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

  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Photo' | 'Record'>('Photo');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isRecording, setIsRecording] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(60 * 5);

  const clearRecordingTimeout = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  };

  const saveDraftAndGoDetail = async (payload: { kind: 'photo' | 'video'; blob: Blob; mimeType: string }) => {
    try {
      window.__postDraft = {
        kind: payload.kind,
        mimeType: payload.mimeType,
        blob: payload.blob,
        createdAt: Date.now(),
      };

      router.push(`/event/${eventId}/post/detail`);
    } catch (err) {
      console.error(err);
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
        video: {
          facingMode: mode
        },
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
      console.error(err);
      setError('Permissão de câmera negada ou não encontrada.');
      return false;
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) return;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, width, height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      await saveDraftAndGoDetail({
        kind: 'photo',
        blob,
        mimeType: 'image/jpeg'
      });

    }, 'image/jpeg', 0.95);
  };

  const startRecording = () => {
    if (!streamRef.current || isRecording) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current);

      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });

        void saveDraftAndGoDetail({
          kind: 'video',
          blob,
          mimeType: 'video/webm'
        });
      };

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.start();

      setIsRecording(true);
      setRemainingSeconds(60);

      clearRecordingTimeout();

      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, MAX_RECORDING_MS);

    } catch (err) {
      console.error(err);
      setError('Não foi possível iniciar a gravação.');
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    if (mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

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
      await startCamera(facingMode);
    }
  };

  useEffect(() => {
    startCamera('user');

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      stopCurrentStream();
      clearRecordingTimeout();
    };
  }, []);

  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div className="relative h-screen w-full bg-[#222222] text-white flex flex-col overflow-hidden">

      <header className="relative z-20 flex items-center justify-between p-4">
        <button className="p-3 bg-white/20 rounded-full">
          <ArrowLeft size={24} />
        </button>

        <h1 className="text-lg font-medium">
          {selectedEventName}
        </h1>

        <div className="w-12" />
      </header>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">

        {error ? (
          <div className="text-center p-6">
            <p className="text-red-400 mb-4">{error}</p>

            <button
              onClick={() => startCamera(facingMode)}
              className="px-6 py-2 bg-white text-black rounded-full font-bold"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="max-w-full max-h-full object-contain"
          />
        )}

        <div className="absolute bottom-0 w-full flex justify-center gap-6 items-end pb-8">

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleCapture}
              className={`w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow-xl active:scale-95 ${
                isRecording ? 'bg-red-500 text-white' : 'bg-neutral-300 text-black'
              }`}
            >
              <span className="text-sm font-bold">
                {activeTab === 'Photo' ? 'Foto' : isRecording ? 'Parar' : 'Gravar'}
              </span>
            </button>

            {activeTab === 'Record' && (
              <span className="text-[11px] text-white/80">
                {isRecording
                  ? `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, '0')}`
                  : 'max 5:00'}
              </span>
            )}
          </div>

          <button
            onClick={handleSwitchCamera}
            className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-md border border-white/20"
          >
            <RefreshCw size={24} />
          </button>

        </div>
      </div>

      <div className="relative z-20 pb-8 flex justify-center">
        <div className="flex bg-black/40 backdrop-blur-xl rounded-full p-1 border border-white/10">

          {['Photo', 'Record'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'Photo' | 'Record')}
              className={`px-5 py-1.5 rounded-full text-xs font-medium ${
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

    </div>
  );
};

export default CameraScreen;