'use client';

import React, { useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import Button from './button'; // Seu componente de botão estilizado
import { getCroppedImg } from '../lib/crop-image';

interface ImageCropperModalProps {
  image: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImage: string) => void;
}

export function ImageCropperModal({ image, isOpen, onClose, onCropComplete }: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  if (!image) return null;

  const handleConfirm = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedImage);
      onClose();
    } catch (e) {
      console.error("Erro ao cortar imagem", e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-white p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold">Ajustar Foto</DialogTitle>
        </DialogHeader>

        <div className="relative w-full h-[350px] mt-4 bg-zinc-900">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
            cropShape="round"
            showGrid={false}
          />
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Zoom</span>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(value) => setZoom(value[0])}
              className="py-2"
            />
          </div>

          <DialogFooter className="flex flex-row gap-3 sm:justify-end">
            <button 
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <div className="flex-1 sm:flex-none min-w-[120px]">
              <Button onClick={handleConfirm} background="#4f46e5">
                Salvar Foto
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}