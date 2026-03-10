'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload } from 'lucide-react';
import axios from 'axios';
import { FileModel } from '@/prisma/app/generated/prisma/models';
import { useRouter } from 'next/navigation';
import { useLoading } from '@/app/zustand/store';

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

type PostDraft = {
  kind: 'photo' | 'video';
  mimeType: string;
  blob?: Blob;
  dataUrl?: string;
  previewUrl: string;
};

const dataUrlToBlob = async (dataUrl: string) => {
  const response = await fetch(dataUrl);
  return response.blob();
};

const optimizeImageToWebp = async (blob: Blob, maxWidth = 1400, quality = 0.78) => {
  const imageBitmap = await createImageBitmap(blob);
  const scale = Math.min(1, maxWidth / imageBitmap.width);
  const targetWidth = Math.round(imageBitmap.width * scale);
  const targetHeight = Math.round(imageBitmap.height * scale);
  
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas não disponível');
  
  ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);
  
  const webpBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), 'image/webp', quality);
  });

  if (!webpBlob) throw new Error('Falha ao converter para WebP');
  return webpBlob;
};

export default function PostDetailsScreen({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [draft, setDraft] = useState<PostDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const router = useRouter();
  const {setIsLoading} = useLoading();

  useEffect(() => {
    let localPreviewUrl: string | null = null;

    try {
      if (window.__postDraft) {
        const memoryDraft = window.__postDraft;
        localPreviewUrl = URL.createObjectURL(memoryDraft.blob);
        setDraft({
          kind: memoryDraft.kind,
          mimeType: memoryDraft.mimeType,
          blob: memoryDraft.blob,
          previewUrl: localPreviewUrl,
        });
        return () => {
          if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
        };
      }

      const rawDraft = sessionStorage.getItem('post-draft');
      if (!rawDraft) {
        setError('Nenhum conteúdo encontrado. Capture novamente.');
        return;
      }

      const parsed = JSON.parse(rawDraft) as { kind: 'photo' | 'video'; mimeType: string; dataUrl: string };
      if (!parsed.dataUrl) {
        setError('Conteúdo inválido. Capture novamente.');
        return;
      }

      setDraft({
        kind: parsed.kind,
        mimeType: parsed.mimeType,
        dataUrl: parsed.dataUrl,
        previewUrl: parsed.dataUrl,
      });
    } catch {
      setError('Falha ao carregar post.');
    }

    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, []);

  const handlePublishPost = async () => {
    if (!draft || isPublishing) return;

    try {
      setIsPublishing(true);
      setIsLoading(true);
      setPublishMessage(null);
      setError(null);

      let fileType;
      let file;

      const payload = new FormData();

      if (draft.kind === 'photo') {
        const sourceBlob = draft.blob ?? (draft.dataUrl ? await dataUrlToBlob(draft.dataUrl) : null);
        if (!sourceBlob) {
          setError('Imagem não encontrada.');
          return;
        }

        fileType = 'photo';

        const webpBlob = await optimizeImageToWebp(sourceBlob);
        file = new File([webpBlob], `post-${Date.now()}.webp`);
      } else {
        fileType = 'video';
        const videoBlob = draft.blob ?? (draft.dataUrl ? await dataUrlToBlob(draft.dataUrl) : null);
        if (!videoBlob) {
          setError('Vídeo não encontrado.');
          return;
        }

        file = new File([videoBlob], `post-${Date.now()}.webm`);      
      }

      const { data: { file: fileModel, url } }: { data: { file: FileModel, url: string } } = await axios.post('/api/s3/presigned_upload', {
        fileType, 
        type: 'post'
      })

      await axios.put(url, file, {
        headers: {
          "Content-Type": file.type
        }
      });
      
      await axios.post('/api/post', {
        file_id: fileModel.id,
        event_id: eventId
      })

      setPublishMessage('Post publicado com sucesso para publicação.');
      window.location.pathname = (`/event/${eventId}`)
    } catch (publishError) {
      console.error('Erro ao preparar post:', publishError);
      setError('Não foi possível preparar o post.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDownloadMedia = async () => {
    if (!draft) return;

    try {
      let file: File | null = null;

      if (draft.kind === 'photo') {
        const sourceBlob = draft.blob ?? (draft.dataUrl ? await dataUrlToBlob(draft.dataUrl) : null);
        if (!sourceBlob) {
          setError('Imagem não encontrada.');
          return;
        }
        const webpBlob = await optimizeImageToWebp(sourceBlob);
        file = new File([webpBlob], `post-${Date.now()}.webp`, { type: 'image/webp' });
      } else {
        const videoBlob = draft.blob ?? (draft.dataUrl ? await dataUrlToBlob(draft.dataUrl) : null);
        if (!videoBlob) {
          setError('Vídeo não encontrado.');
          return;
        }
        file = new File([videoBlob], `post-${Date.now()}.webm`, { type: 'video/webm' });
      }

      const downloadUrl = URL.createObjectURL(file);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = file.name;
      anchor.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (downloadError) {
      console.error('Erro ao baixar post:', downloadError);
      setError('Não foi possível baixar o arquivo.');
    }
  };

  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col">
      <header className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <Link href={`/event/${eventId}/post/post`} className="p-2 bg-zinc-900 rounded-full border border-zinc-700">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-sm font-medium truncate px-3">{eventName}</h1>
        <div className="w-9" />
      </header>

      <main className="flex-1 p-4 flex flex-col gap-4">
        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex-1 flex items-center justify-center">
          {draft?.kind === 'photo' && (
            <img src={draft.previewUrl} alt="Preview da foto" className="w-full h-full object-contain bg-black" />
          )}
          {draft?.kind === 'video' && (
            <video src={draft.previewUrl} controls className="w-full h-full object-contain bg-black" />
          )}
          {!draft && !error && <p className="text-zinc-400 text-sm">Carregando...</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handlePublishPost}
            disabled={!draft || isPublishing}
            className="w-full py-3 rounded-full bg-white text-black font-semibold disabled:opacity-50"
          >
            {isPublishing ? 'Publicando...' : 'Publicar Post'}
          </button>
          <button
            onClick={handleDownloadMedia}
            disabled={!draft || isPublishing}
            className="w-full py-3 rounded-full border border-zinc-600 text-white font-semibold disabled:opacity-50"
          >
            Download
          </button>
        </div>

        {publishMessage && <p className="text-center text-xs text-white/80">{publishMessage}</p>}
      </main>
    </div>
  );
}
